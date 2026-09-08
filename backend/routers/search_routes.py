import sys, os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from fastapi import APIRouter, Query, HTTPException, Depends, Response
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

BROWSER_HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36",
    "Accept": "application/pdf,*/*",
    "Accept-Encoding": "identity"
}

@router.get("/download-pdf")
async def download_pdf_proxy(
    pmid: str = Query(..., description="PubMed ID"),
    pmc_id: str = Query(None, description="PMC ID"),
    doi: str = Query(None, description="DOI")
):
    """Reliable multi-route binary PDF streamer."""
    clean_pmc = pmc_id.strip() if pmc_id else ""
    if clean_pmc and not clean_pmc.upper().startswith("PMC"):
        clean_pmc = f"PMC{clean_pmc}"

    async with httpx.AsyncClient(timeout=30.0, follow_redirects=True) as client:
        # Route 1: Europe PMC Binary Endpoint (Handles most PMC papers reliably)
        if clean_pmc:
            try:
                epmc_url = f"https://europepmc.org/backend/ptpmcrender.fcgi?accid={clean_pmc}&blobtype=pdf"
                res = await client.get(epmc_url, headers=BROWSER_HEADERS)
                if res.status_code == 200 and res.content.startswith(b"%PDF"):
                    return Response(
                        content=res.content,
                        media_type="application/pdf",
                        headers={
                            "Content-Disposition": f'attachment; filename="Evidex_Study_{pmid}.pdf"',
                            "Content-Type": "application/pdf"
                        }
                    )
            except Exception:
                pass

        # Route 2: NCBI Direct Web Storage
        if clean_pmc:
            try:
                ncbi_url = f"https://www.ncbi.nlm.nih.gov/pmc/articles/{clean_pmc}/pdf/"
                res = await client.get(ncbi_url, headers=BROWSER_HEADERS)
                if res.status_code == 200 and res.content.startswith(b"%PDF"):
                    return Response(
                        content=res.content,
                        media_type="application/pdf",
                        headers={
                            "Content-Disposition": f'attachment; filename="Evidex_Study_{pmid}.pdf"',
                            "Content-Type": "application/pdf"
                        }
                    )
            except Exception:
                pass

        # Route 3: Unpaywall Open Access Lookup via DOI
        if doi:
            try:
                u_res = await client.get(f"https://api.unpaywall.org/v2/{doi}?email=research@evidex.ai", timeout=8.0)
                if u_res.status_code == 200:
                    best_url = u_res.json().get("best_oa_location", {}).get("url_for_pdf")
                    if best_url:
                        pdf_res = await client.get(best_url, headers=BROWSER_HEADERS)
                        if pdf_res.status_code == 200 and pdf_res.content.startswith(b"%PDF"):
                            return Response(
                                content=pdf_res.content,
                                media_type="application/pdf",
                                headers={
                                    "Content-Disposition": f'attachment; filename="Evidex_Study_{pmid}.pdf"',
                                    "Content-Type": "application/pdf"
                                }
                            )
            except Exception:
                pass

    raise HTTPException(status_code=404, detail="Paper restricted to journal subscribers")

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

        study_context = "\n".join([
            f"- Title: {s['title']} (PMID: {s['pmid']}, Type: {s['badge']}, Stats: {s['statistics']})\n  Abstract: {s['abstract'][:350]}"
            for s in studies
        ])
        prompt = f"Question: {q}\n\nHuman Studies:\n{study_context}\n\nSynthesize findings into 3 evidence points with PMID citations."
        ai_result = await execute_llm_resilient_chain(prompt, client)

        return {
            "query": q,
            "total_studies_scanned": len(studies),
            "summary": ai_result.get("summary", ""),
            "consensus": ai_result.get("consensus", {"yes": 70, "inconclusive": 20, "no": 10}),
            "pharma_bias_analysis": {"is_locked": False, "data": None},
            "studies": studies
        }

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
    return "\n\n".join([f"{s['authors']} ({s['pubdate']}). {s['title']}. {s['source']}. https://pubmed.ncbi.nlm.nih.gov/{s['pmid']}/" for s in studies])
