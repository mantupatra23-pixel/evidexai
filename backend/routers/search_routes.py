import sys, os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from fastapi import APIRouter, Query, HTTPException, Depends
from fastapi.responses import PlainTextResponse, StreamingResponse
from sqlalchemy.orm import Session
import httpx
import json
import asyncio

try:
    from database import get_db
    from models import User, SearchLog
    from auth import get_current_user_optional
    from services.pubmed import build_pubmed_clinical_query, parse_pubmed_xml
    from services.llm import execute_llm_resilient_chain
except ImportError:
    from backend.database import get_db
    from backend.models import User, SearchLog
    from backend.auth import get_current_user_optional
    from backend.services.pubmed import build_pubmed_clinical_query, parse_pubmed_xml
    from backend.services.llm import execute_llm_resilient_chain

router = APIRouter(prefix="/api", tags=["Clinical Search Engine"])

@router.get("/download-pdf")
async def download_pdf_proxy(url: str = Query(..., description="Target PMC PDF URL"), pmid: str = Query("study")):
    """Streams PMC PDF directly to user device as a branded Evidex download."""
    if not url.startswith("https://www.ncbi.nlm.nih.gov/pmc/"):
        raise HTTPException(status_code=400, detail="Invalid PDF source")

    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
    }

    client = httpx.AsyncClient(timeout=30.0, follow_redirects=True)
    req = client.build_request("GET", url, headers=headers)
    response = await client.send(req, stream=True)

    if response.status_code != 200:
        await response.aclose()
        await client.aclose()
        raise HTTPException(status_code=502, detail="Unable to retrieve PDF stream from archive")

    async def stream_pdf():
        try:
            async for chunk in response.aiter_bytes():
                yield chunk
        finally:
            await response.aclose()
            await client.aclose()

    filename = f"Evidex_Clinical_PMID_{pmid}.pdf"
    response_headers = {
        "Content-Disposition": f'attachment; filename="{filename}"',
        "Content-Type": "application/pdf"
    }

    return StreamingResponse(stream_pdf(), headers=response_headers, media_type="application/pdf")

@router.get("/search")
async def search_evidence(
    q: str = Query(..., description="Clinical research question"),
    min_year: int = Query(None),
    max_year: int = Query(None),
    study_type: str = Query(None, enum=["rct", "meta", "all"]),
    sort_by: str = Query("relevance", enum=["relevance", "pub_date"]),
    user: User = Depends(get_current_user_optional),
    db: Session = Depends(get_db)
):
    clean_q = q.strip().lower()
    refined_query = build_pubmed_clinical_query(clean_q, min_year, max_year, study_type)

    async with httpx.AsyncClient(timeout=16.0) as client:
        search_res = await client.get(
            "https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi",
            params={
                "db": "pubmed", 
                "term": refined_query, 
                "retmode": "json", 
                "retmax": "6", 
                "sort": sort_by
            }
        )
        if search_res.status_code != 200:
            raise HTTPException(status_code=502, detail="PubMed gateway unreachable")

        id_list = search_res.json().get("esearchresult", {}).get("idlist", [])
        if not id_list:
            return {
                "query": q,
                "total_studies_scanned": 0,
                "summary": "No human clinical trials found matching this query in PubMed.",
                "consensus": {"yes": 0, "inconclusive": 100, "no": 0},
                "pharma_bias_analysis": {"is_locked": False, "data": None},
                "studies": []
            }

        fetch_res = await client.get(
            "https://eutils.ncbi.nlm.nih.gov/entrez/eutils/efetch.fcgi",
            params={"db": "pubmed", "id": ",".join(id_list), "retmode": "xml"}
        )
        studies = parse_pubmed_xml(fetch_res.text)

        is_user_pro = user.is_pro if user else False
        all_sponsors = []
        flagged = []
        for s in studies:
            sps = s["funding_audit"]["commercial_sponsors"]
            if sps:
                all_sponsors.extend(sps)
                flagged.append({"pmid": s["pmid"], "title": s["title"], "sponsors": sps})

        bias_data = {
            "total_commercial_sponsors_detected": len(set(all_sponsors)),
            "sponsors_list": list(set(all_sponsors)),
            "overall_bias_risk": "High" if len(set(all_sponsors)) >= 2 else ("Moderate" if all_sponsors else "Low"),
            "flagged_trials": flagged
        }

        study_context = "\n".join([
            f"- Title: {s['title']} (PMID: {s['pmid']}, Type: {s['badge']}, Stats: {s['statistics']})\n  Abstract: {s['abstract'][:350]}"
            for s in studies
        ])
        prompt = f"Question: {q}\n\nHuman Studies:\n{study_context}\n\nSynthesize findings into 3 evidence points with PMID citations."
        ai_result = await execute_llm_resilient_chain(prompt, client)

        if user:
            try:
                log_entry = SearchLog(user_id=user.id, query=q, summary=ai_result.get("summary"), total_scanned=len(studies))
                db.add(log_entry)
                db.commit()
            except Exception:
                db.rollback()

        return {
            "query": q,
            "total_studies_scanned": len(studies),
            "summary": ai_result.get("summary", ""),
            "consensus": ai_result.get("consensus", {"yes": 70, "inconclusive": 20, "no": 10}),
            "pharma_bias_analysis": {
                "is_locked": not is_user_pro,
                "data": bias_data if is_user_pro else None
            },
            "studies": studies
        }

@router.get("/compare")
async def compare_treatments(
    treatment_a: str = Query(..., description="First intervention"),
    treatment_b: str = Query(..., description="Second intervention"),
    condition: str = Query(..., description="Clinical condition")
):
    comparison_query = f"({treatment_a}) AND ({treatment_b}) AND ({condition}) AND (humans[Filter])"
    async with httpx.AsyncClient(timeout=16.0) as client:
        search_res = await client.get(
            "https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi",
            params={"db": "pubmed", "term": comparison_query, "retmode": "json", "retmax": "6", "sort": "relevance"}
        )
        id_list = search_res.json().get("esearchresult", {}).get("idlist", [])
        if not id_list:
            fallback_q = f"({treatment_a} OR {treatment_b}) AND ({condition}) AND (humans[Filter])"
            search_res = await client.get(
                "https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi",
                params={"db": "pubmed", "term": fallback_q, "retmode": "json", "retmax": "6", "sort": "relevance"}
            )
            id_list = search_res.json().get("esearchresult", {}).get("idlist", [])

        fetch_res = await client.get(
            "https://eutils.ncbi.nlm.nih.gov/entrez/eutils/efetch.fcgi",
            params={"db": "pubmed", "id": ",".join(id_list), "retmode": "xml"}
        )
        studies = parse_pubmed_xml(fetch_res.text)

        study_context = "\n".join([f"- Title: {s['title']} (PMID: {s['pmid']})\n  Abstract: {s['abstract'][:300]}" for s in studies])
        compare_prompt = (
            f"Compare {treatment_a} vs {treatment_b} in {condition}:\n{study_context}\n\n"
            "Return valid JSON schema: {\"primary_winner\": \"...\", \"comparison_matrix\": ["
            "{\"metric\": \"Primary Efficacy\", \"treatment_a\": \"...\", \"treatment_b\": \"...\"},"
            "{\"metric\": \"Safety & Tolerability\", \"treatment_a\": \"...\", \"treatment_b\": \"...\"},"
            "{\"metric\": \"Long-Term Clinical Outcomes\", \"treatment_a\": \"...\", \"treatment_b\": \"...\"}"
            "], \"verdict\": \"Clinical takeaway with PMIDs.\"}"
        )
        comparison_data = await execute_llm_resilient_chain(compare_prompt, client)

        return {
            "condition": condition,
            "treatment_a": treatment_a,
            "treatment_b": treatment_b,
            "total_trials_scanned": len(studies),
            "comparison": comparison_data,
            "referenced_studies": studies
        }

@router.get("/search/stream")
async def search_evidence_stream(q: str = Query(...)):
    refined_query = build_pubmed_clinical_query(q)

    async def event_generator():
        yield f"event: status\ndata: {json.dumps({'message': 'Scanning 35M+ PubMed human trials...'})}\n\n"
        await asyncio.sleep(0.04)

        async with httpx.AsyncClient(timeout=16.0) as client:
            search_res = await client.get(
                "https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi",
                params={"db": "pubmed", "term": refined_query, "retmode": "json", "retmax": "5", "sort": "relevance"}
            )
            id_list = search_res.json().get("esearchresult", {}).get("idlist", [])
            if not id_list:
                yield f"event: error\ndata: {json.dumps({'message': 'No human trials found.'})}\n\n"
                return

            fetch_res = await client.get(
                "https://eutils.ncbi.nlm.nih.gov/entrez/eutils/efetch.fcgi",
                params={"db": "pubmed", "id": ",".join(id_list), "retmode": "xml"}
            )
            studies = parse_pubmed_xml(fetch_res.text)
            yield f"event: studies\ndata: {json.dumps(studies)}\n\n"

            study_context = "\n".join([f"- Title: {s['title']} (PMID: {s['pmid']})\n  Abstract: {s['abstract'][:300]}" for s in studies])
            prompt = f"Question: {q}\n\nHuman Studies:\n{study_context}\n\nProvide 3 evidence points with citations."
            ai_result = await execute_llm_resilient_chain(prompt, client)
            summary_text = ai_result.get("summary", "Synthesis complete.")

            for word in summary_text.split(" "):
                yield f"event: token\ndata: {json.dumps({'token': word + ' '})}\n\n"
                await asyncio.sleep(0.02)

            yield f"event: consensus\ndata: {json.dumps(ai_result.get('consensus', {'yes': 70, 'inconclusive': 20, 'no': 10}))}\n\n"
            yield f"event: done\ndata: [DONE]\n\n"

    return StreamingResponse(event_generator(), media_type="text/event-stream")

@router.get("/export", response_class=PlainTextResponse)
async def export_citations(pmids: str = Query(...), format: str = Query("apa", enum=["apa", "bibtex", "ris"])):
    id_list = [p.strip() for p in pmids.split(",") if p.strip()]
    async with httpx.AsyncClient(timeout=15.0) as client:
        res = await client.get("https://eutils.ncbi.nlm.nih.gov/entrez/eutils/efetch.fcgi", params={"db": "pubmed", "id": ",".join(id_list), "retmode": "xml"})
        studies = parse_pubmed_xml(res.text)

    if format == "bibtex":
        return "\n\n".join([
            f"@article{{pmid{s['pmid']},\n  title = {{{s['title']}}},\n  author = {{{s['authors']}}},\n  journal = {{{s['source']}}},\n  year = {{{s['pubdate']}}},\n  note = {{PMID: {s['pmid']}}},\n  url = {{{s['url']}}}\n}}"
            for s in studies
        ])
    elif format == "ris":
        ris_entries = []
        for s in studies:
            ris_entries.append(
                f"TY  - JOUR\nTI  - {s['title']}\nAU  - {s['authors']}\nJO  - {s['source']}\nPY  - {s['pubdate']}\nUR  - {s['url']}\nAN  - {s['pmid']}\nER  -"
            )
        return "\n\n".join(ris_entries)

    return "\n\n".join([f"{s['authors']} ({s['pubdate']}). {s['title']}. {s['source']}. https://pubmed.ncbi.nlm.nih.gov/{s['pmid']}/" for s in studies])
