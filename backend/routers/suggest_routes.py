from fastapi import APIRouter, Query
import httpx

router = APIRouter(prefix="/api", tags=["Autocomplete"])

@router.get("/suggest")
async def autocomplete_medical_query(q: str = Query(..., min_length=2)):
    """Fast NCBI E-Utilities auto-suggest for medical and clinical terms."""
    url = f"https://eutils.ncbi.nlm.nih.gov/entrez/eutils/espell.fcgi?db=pubmed&term={q}"
    suggestions = []
    try:
        async with httpx.AsyncClient(timeout=4.0) as client:
            res = await client.get(url)
            if res.status_code == 200 and "<CorrectedQuery>" in res.text:
                start = res.text.find("<CorrectedQuery>") + len("<CorrectedQuery>")
                end = res.text.find("</CorrectedQuery>")
                corrected = res.text[start:end].strip()
                if corrected and corrected.lower() != q.lower():
                    suggestions.append(corrected)
    except Exception:
        pass

    # Quick clinical expansion suggestions
    q_low = q.lower()
    common_templates = [
        f"{q_low} randomized controlled trial",
        f"{q_low} meta-analysis clinical efficacy",
        f"{q_low} adverse events and safety"
    ]
    for t in common_templates:
        if t not in suggestions:
            suggestions.append(t)

    return {"query": q, "suggestions": suggestions[:4]}
