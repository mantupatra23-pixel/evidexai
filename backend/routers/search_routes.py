import sys, os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from fastapi import APIRouter, Query, Response
import httpx
from services.pubmed import build_pubmed_clinical_query, parse_pubmed_xml
from services.llm import execute_llm_resilient_chain

router = APIRouter(prefix="/api", tags=["search"])

@router.get("/search")
async def search_endpoint(q: str = Query(..., description="Clinical research query")):
    query_str = q.strip()
    pubmed_q = build_pubmed_clinical_query(query_str)
    esearch_url = "https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi"
    efetch_url = "https://eutils.ncbi.nlm.nih.gov/entrez/eutils/efetch.fcgi"

    studies = []
    async with httpx.AsyncClient(timeout=8.0) as client:
        # Step 1: Fetch PubMed Studies
        try:
            res = await client.get(esearch_url, params={"db": "pubmed", "term": pubmed_q, "retmax": 8, "retmode": "json"})
            if res.status_code == 200:
                id_list = res.json().get("esearchresult", {}).get("idlist", [])
                if id_list:
                    fetch_res = await client.get(efetch_url, params={"db": "pubmed", "id": ",".join(id_list), "retmode": "xml"})
                    if fetch_res.status_code == 200:
                        studies = parse_pubmed_xml(fetch_res.text)
        except Exception as e:
            print(f"PubMed retrieval warning: {e}")

        # Step 2: Synthesis with 5s timeout
        evidence_context = f"Query: {query_str}\n"
        for s in studies[:5]:
            evidence_context += f"Title: {s['title']}\nAbstract: {s['abstract'][:300]}\nBadge: {s['badge']}\n\n"

        synthesis_data = await execute_llm_resilient_chain(evidence_context, client)

    return {
        "query": query_str,
        "total_studies_scanned": len(studies),
        "summary": synthesis_data,
        "studies": studies
    }

@router.get("/export")
async def export_citation(pmids: str = Query(...), format: str = Query("apa")):
    ids = pmids.split(",")
    return Response(
        content=f"Evidex Clinical Report Citation. Retrieved from PubMed database for PMIDs: {', '.join(ids)} (2026).",
        media_type="text/plain"
    )
