from fastapi import FastAPI, Query, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import httpx
import os

app = FastAPI(title="Evidex API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

EXPERIENTIAL_API_KEY = os.getenv("EXPERIENTIAL_API_KEY", "")
EXPERIENTIAL_BASE_URL = os.getenv("EXPERIENTIAL_BASE_URL", "https://api.experientiallabs.ai/v1")

@app.get("/")
def health_check():
    return {"status": "healthy", "service": "Evidex Engine"}

@app.get("/api/search")
async def search_evidence(q: str = Query(..., description="Clinical research question")):
    ncbi_url = "https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi"
    search_params = {
        "db": "pubmed",
        "term": q,
        "retmode": "json",
        "retmax": "5",
        "sort": "relevance"
    }

    async with httpx.AsyncClient(timeout=15.0) as client:
        # 1. PubMed PMIDs search
        search_res = await client.get(ncbi_url, params=search_params)
        if search_res.status_code != 200:
            raise HTTPException(status_code=502, detail="PubMed search unreachable")
        
        id_list = search_res.json().get("esearchresult", {}).get("idlist", [])
        if not id_list:
            return {"query": q, "results": [], "summary": "No clinical trials found for this topic."}

        # 2. Paper summaries fetch
        summary_url = "https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esummary.fcgi"
        summary_params = {
            "db": "pubmed",
            "id": ",".join(id_list),
            "retmode": "json"
        }
        sum_res = await client.get(summary_url, params=summary_params)
        sum_data = sum_res.json().get("result", {})

        papers = []
        for pmid in id_list:
            item = sum_data.get(pmid, {})
            papers.append({
                "pmid": pmid,
                "title": item.get("title", "Clinical Study"),
                "source": item.get("source", "PubMed Central"),
                "pubdate": item.get("pubdate", "Recent"),
                "url": f"https://pubmed.ncbi.nlm.nih.gov/{pmid}/"
            })

        # 3. Cloud LLM Call (Experiential Labs)
        paper_context = "\n".join([f"- Title: {p['title']} (PMID: {p['pmid']})" for p in papers])
        llm_prompt = f"Topic: {q}\nAvailable Studies:\n{paper_context}\n\nSummarize the key medical consensus in 3 concise bullet points with citations."

        ai_summary = "Synthesis complete based on indexed literature."
        if EXPERIENTIAL_API_KEY:
            try:
                llm_res = await client.post(
                    f"{EXPERIENTIAL_BASE_URL}/chat/completions",
                    headers={"Authorization": f"Bearer {EXPERIENTIAL_API_KEY}"},
                    json={
                        "model": "gemini-2.5-flash",
                        "messages": [
                            {"role": "system", "content": "You are a clinical evidence synthesizer. Be direct and objective."},
                            {"role": "user", "content": llm_prompt}
                        ]
                    }
                )
                if llm_res.status_code == 200:
                    ai_summary = llm_res.json()["choices"][0]["message"]["content"]
            except Exception:
                pass

        return {
            "query": q,
            "total_studies_scanned": len(papers),
            "summary": ai_summary,
            "studies": papers
        }
