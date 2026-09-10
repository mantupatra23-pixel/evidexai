import sys, os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from fastapi import APIRouter, Query, Response
import httpx
from services.agents import run_multi_agent_pipeline
from services.llm import execute_llm_resilient_chain

router = APIRouter(prefix="/api", tags=["search"])

@router.get("/search")
async def search_endpoint(q: str = Query(..., description="Clinical research query")):
    query_str = q.strip()
    
    async with httpx.AsyncClient(timeout=10.0) as client:
        # Run Multi-Agent Pipeline
        pipeline_result = await run_multi_agent_pipeline(query_str, client)
        studies = pipeline_result["studies"]
        steps_log = pipeline_result["steps_log"]

        # Run Synthesis LLM
        evidence_context = f"Query: {query_str}\n"
        for s in studies[:6]:
            evidence_context += f"Title: {s['title']}\nAbstract: {s['abstract'][:300]}\nBadge: {s['badge']}\n\n"

        synthesis_data = await execute_llm_resilient_chain(evidence_context, client)

    return {
        "query": query_str,
        "total_studies_scanned": len(studies),
        "agent_steps": steps_log,
        "summary": synthesis_data,
        "studies": studies
    }

@router.get("/export")
async def export_citation(pmids: str = Query(...), format: str = Query("apa")):
    ids = pmids.split(",")
    return Response(
        content=f"Evidex Multi-Agent Consensus Citation. Retrieved from PubMed for PMIDs: {', '.join(ids)} (2026).",
        media_type="text/plain"
    )
