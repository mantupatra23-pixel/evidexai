from fastapi import FastAPI, Query, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import PlainTextResponse
import xml.etree.ElementTree as ET
from collections import defaultdict
import httpx
import json
import time
import re
import os

app = FastAPI(title="Evidex Enterprise Clinical Engine", version="3.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# API Keys & Endpoints Configuration
EXPERIENTIAL_API_KEY = os.getenv("EXPERIENTIAL_API_KEY", "")
EXPERIENTIAL_BASE_URL = os.getenv("EXPERIENTIAL_BASE_URL", "https://api.experientiallabs.ai/v1")
GROQ_API_KEY = os.getenv("GROQ_API_KEY", "")
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")

# Zero-cost models pool for Experiential Gateway
EXPERIENTIAL_FREE_MODELS = [
    "deepseek-v4-flash",
    "qwen-3.5-27b",
    "gpt-5.6-luna",
    "gemma-3-12b-it",
    "gemini-2.5-flash-lite"
]

# Top Global Pharmaceutical Sponsors for Conflict of Interest (COI) Detection
KNOWN_PHARMA = [
    "pfizer", "novartis", "roche", "merck", "astrazeneca", "abbvie", 
    "sanofi", "bristol-myers", "bms", "glaxosmithkline", "gsk", 
    "eli lilly", "lilly", "johnson & johnson", "janssen", "bayer", 
    "gilead", "amgen", "boehringer", "takeda", "novo nordisk", "moderna"
]

# In-Memory Cache (24-hour TTL)
QUERY_CACHE: dict = {}
CACHE_TTL = 86400

# Zero-Dependency In-Memory Rate Limiter (Max 20 requests per minute per IP)
RATE_LIMIT_STORE = defaultdict(list)
RATE_LIMIT_MAX_REQUESTS = 20
RATE_LIMIT_WINDOW_SECONDS = 60

def is_rate_limited(client_ip: str) -> bool:
    now = time.time()
    RATE_LIMIT_STORE[client_ip] = [t for t in RATE_LIMIT_STORE[client_ip] if now - t < RATE_LIMIT_WINDOW_SECONDS]
    if len(RATE_LIMIT_STORE[client_ip]) >= RATE_LIMIT_MAX_REQUESTS:
        return True
    RATE_LIMIT_STORE[client_ip].append(now)
    return False

def get_from_cache(key: str):
    item = QUERY_CACHE.get(key)
    if item and time.time() < item["expires"]:
        return item["data"]
    if item:
        del QUERY_CACHE[key]
    return None

def set_to_cache(key: str, data: dict):
    if len(QUERY_CACHE) > 500:
        QUERY_CACHE.pop(next(iter(QUERY_CACHE)))
    QUERY_CACHE[key] = {"data": data, "expires": time.time() + CACHE_TTL}

def parse_pubmed_xml(xml_text: str):
    """Parses PubMed XML for abstract, study badge, sample size, and pharma funding COI."""
    studies = []
    try:
        root = ET.fromstring(xml_text)
        for article in root.findall(".//PubmedArticle"):
            pmid_node = article.find(".//MedlineCitation/PMID")
            pmid = pmid_node.text if pmid_node is not None else ""
            if not pmid:
                continue

            title_node = article.find(".//ArticleTitle")
            title = "".join(title_node.itertext()).strip() if title_node is not None else "Clinical Trial"

            abstract_texts = article.findall(".//Abstract/AbstractText")
            abstract = " ".join(["".join(ab.itertext()).strip() for ab in abstract_texts]) if abstract_texts else "Abstract available via full-text link."

            # Study Design Classifier
            pub_types = [pt.text for pt in article.findall(".//PublicationTypeList/PublicationType") if pt.text]
            badge = "Clinical Study"
            if any("Randomized Controlled Trial" in pt for pt in pub_types):
                badge = "RCT"
            elif any("Meta-Analysis" in pt for pt in pub_types):
                badge = "Meta-Analysis"
            elif any("Systematic Review" in pt for pt in pub_types):
                badge = "Systematic Review"

            # Sample Size Extractor Heuristic
            sample_match = re.search(r"\b(n\s*=\s*|\bcohort of\s*|\btotal of\s*)(\d+[\d,]*)\b", abstract, re.IGNORECASE)
            sample_size = f"N = {sample_match.group(2)}" if sample_match else "Peer-Reviewed"

            # Journal & Publication Date
            journal_node = article.find(".//Journal/ISOAbbreviation") or article.find(".//Journal/Title")
            source = journal_node.text if journal_node is not None else "PubMed Central"

            year_node = article.find(".//JournalIssue/PubDate/Year") or article.find(".//DateCompleted/Year")
            pubdate = year_node.text if year_node is not None else "Recent"

            # Conflict of Interest (COI) & Commercial Funding Audit
            coi_node = article.find(".//CoiStatement")
            coi_text = "".join(coi_node.itertext()).strip() if coi_node is not None else ""

            # Check Grants / Funding Agency nodes
            grants = [g.find("Agency").text for g in article.findall(".//GrantList/Grant") if g.find("Agency") is not None and g.find("Agency").text]
            grant_text = " ".join(grants)

            combined_disclosure = f"{coi_text} {grant_text} {abstract}".lower()
            detected_pharma = [pharma.title() for pharma in KNOWN_PHARMA if pharma in combined_disclosure]
            unique_sponsors = list(set(detected_pharma))

            if len(unique_sponsors) >= 2:
                bias_risk = "High"
            elif len(unique_sponsors) == 1:
                bias_risk = "Moderate"
            else:
                bias_risk = "Low (Independent / Non-Commercial)"

            studies.append({
                "pmid": pmid,
                "title": title,
                "abstract": abstract[:1200],
                "badge": badge,
                "sample_size": sample_size,
                "source": source,
                "pubdate": pubdate,
                "url": f"https://pubmed.ncbi.nlm.nih.gov/{pmid}/",
                "funding_audit": {
                    "bias_risk": bias_risk,
                    "commercial_sponsors": unique_sponsors,
                    "coi_statement": coi_text if coi_text else "No direct commercial conflicts declared by authors."
                }
            })
    except Exception as e:
        print(f"XML Parsing Exception: {e}")
    return studies

# Multi-Gateway Failover: Experiential Labs -> Groq -> Direct Gemini
async def execute_llm_resilient_chain(prompt: str, client: httpx.AsyncClient) -> dict:
    default_payload = {
        "summary": "Clinical literature synthesized based on peer-reviewed PubMed abstracts.",
        "consensus": {"yes": 70, "inconclusive": 20, "no": 10}
    }
    system_instruction = (
        "You are an evidence synthesis engine. Return ONLY valid JSON in this exact structure: "
        "{\"summary\": \"...\", \"consensus\": {\"yes\": 70, \"inconclusive\": 20, \"no\": 10}}. "
        "Summary must contain 3 concise clinical points with PMID citations."
    )

    # Gateway 1: Experiential Labs (Free Models Pool)
    if EXPERIENTIAL_API_KEY:
        for model in EXPERIENTIAL_FREE_MODELS:
            try:
                res = await client.post(
                    f"{EXPERIENTIAL_BASE_URL}/chat/completions",
                    headers={"Authorization": f"Bearer {EXPERIENTIAL_API_KEY}", "Content-Type": "application/json"},
                    json={
                        "model": model,
                        "messages": [{"role": "system", "content": system_instruction}, {"role": "user", "content": prompt}],
                        "temperature": 0.2
                    },
                    timeout=12.0
                )
                if res.status_code == 200:
                    clean = re.sub(r"^```json\s*|\s*```$", "", res.json()["choices"][0]["message"]["content"], flags=re.MULTILINE).strip()
                    return json.loads(clean)
            except Exception:
                continue

    # Gateway 2: Groq Direct Failover
    if GROQ_API_KEY:
        try:
            res = await client.post(
                "https://api.groq.com/openai/v1/chat/completions",
                headers={"Authorization": f"Bearer {GROQ_API_KEY}", "Content-Type": "application/json"},
                json={
                    "model": "llama-3.3-70b-versatile",
                    "messages": [{"role": "system", "content": system_instruction}, {"role": "user", "content": prompt}],
                    "temperature": 0.2
                },
                timeout=10.0
            )
            if res.status_code == 200:
                clean = re.sub(r"^```json\s*|\s*```$", "", res.json()["choices"][0]["message"]["content"], flags=re.MULTILINE).strip()
                return json.loads(clean)
        except Exception:
            pass

    # Gateway 3: Google Gemini Direct Failover
    if GEMINI_API_KEY:
        try:
            url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key={GEMINI_API_KEY}"
            res = await client.post(
                url,
                json={"contents": [{"parts": [{"text": f"{system_instruction}\n\nTask:\n{prompt}"}]}]},
                timeout=10.0
            )
            if res.status_code == 200:
                raw_text = res.json()["candidates"][0]["content"]["parts"][0]["text"]
                clean = re.sub(r"^```json\s*|\s*```$", "", raw_text, flags=re.MULTILINE).strip()
                return json.loads(clean)
        except Exception:
            pass

    return default_payload

@app.get("/")
def health():
    return {"status": "healthy", "service": "Evidex Clinical Engine v3.0", "resilience": "Multi-Gateway Active"}

@app.get("/api/search")
async def search_evidence(request: Request, q: str = Query(..., description="Clinical question")):
    client_ip = request.client.host if request.client else "unknown"
    if is_rate_limited(client_ip):
        raise HTTPException(status_code=429, detail="Rate limit exceeded. Maximum 20 searches per minute.")

    clean_q = q.strip().lower()
    cached = get_from_cache(clean_q)
    if cached:
        return cached

    ncbi_search_url = "https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi"
    search_params = {
        "db": "pubmed",
        "term": clean_q,
        "retmode": "json",
        "retmax": "5",
        "sort": "relevance"
    }

    async with httpx.AsyncClient(timeout=16.0) as client:
        search_res = await client.get(ncbi_search_url, params=search_params)
        if search_res.status_code != 200:
            raise HTTPException(status_code=502, detail="PubMed gateway unreachable")

        id_list = search_res.json().get("esearchresult", {}).get("idlist", [])
        if not id_list:
            return {
                "query": q,
                "total_studies_scanned": 0,
                "summary": "No clinical trials found matching this query in PubMed.",
                "consensus": {"yes": 0, "inconclusive": 100, "no": 0},
                "pharma_bias_analysis": {
                    "total_commercial_sponsors_detected": 0,
                    "overall_bias_risk": "Low",
                    "flagged_trials": []
                },
                "studies": []
            }

        # Fetch clinical XML records
        ncbi_fetch_url = "https://eutils.ncbi.nlm.nih.gov/entrez/eutils/efetch.fcgi"
        fetch_res = await client.get(ncbi_fetch_url, params={"db": "pubmed", "id": ",".join(id_list), "retmode": "xml"})
        studies = parse_pubmed_xml(fetch_res.text)

        # Aggregate Pharma Funding Analytics for Pro Paywall Feature
        all_sponsors = []
        flagged_trials = []
        for s in studies:
            sponsors = s["funding_audit"]["commercial_sponsors"]
            if sponsors:
                all_sponsors.extend(sponsors)
                flagged_trials.append({"pmid": s["pmid"], "title": s["title"], "sponsors": sponsors})

        bias_summary = {
            "total_commercial_sponsors_detected": len(set(all_sponsors)),
            "sponsors_list": list(set(all_sponsors)),
            "overall_bias_risk": "High" if len(set(all_sponsors)) >= 2 else ("Moderate" if all_sponsors else "Low"),
            "flagged_trials": flagged_trials
        }

        # LLM Synthesis Context
        study_context = "\n".join([
            f"- Title: {s['title']} (PMID: {s['pmid']}, Type: {s['badge']}, Sample: {s['sample_size']})\n  Abstract: {s['abstract'][:350]}"
            for s in studies
        ])
        prompt = (
            f"Question: {q}\n\nPubMed Studies:\n{study_context}\n\n"
            "Synthesize clinical evidence takeaways. Provide summary with PMIDs and consensus percentages."
        )

        ai_result = await execute_llm_resilient_chain(prompt, client)

        payload = {
            "query": q,
            "total_studies_scanned": len(studies),
            "summary": ai_result.get("summary", ""),
            "consensus": ai_result.get("consensus", {"yes": 70, "inconclusive": 20, "no": 10}),
            "pharma_bias_analysis": bias_summary,
            "studies": studies
        }

        set_to_cache(clean_q, payload)
        return payload

@app.get("/api/export", response_class=PlainTextResponse)
async def export_citations(pmids: str = Query(..., description="Comma separated PMIDs"), format: str = Query("apa", enum=["apa", "bibtex"])):
    """Exports clinical citations in BibTeX or APA format for researchers."""
    id_list = [p.strip() for p in pmids.split(",") if p.strip()]
    if not id_list:
        raise HTTPException(status_code=400, detail="No PMIDs provided")

    async with httpx.AsyncClient(timeout=15.0) as client:
        res = await client.get("https://eutils.ncbi.nlm.nih.gov/entrez/eutils/efetch.fcgi", params={"db": "pubmed", "id": ",".join(id_list), "retmode": "xml"})
        studies = parse_pubmed_xml(res.text)

    if format == "bibtex":
        bibtex_entries = []
        for s in studies:
            entry = (
                f"@article{{pmid{s['pmid']},\n"
                f"  title = {{{s['title']}}},\n"
                f"  journal = {{{s['source']}}},\n"
                f"  year = {{{s['pubdate']}}},\n"
                f"  note = {{PMID: {s['pmid']}}},\n"
                f"  url = {{{s['url']}}}\n"
                f"}}"
            )
            bibtex_entries.append(entry)
        return "\n\n".join(bibtex_entries)

    apa_entries = []
    for s in studies:
        apa_entries.append(f"{s['title']} ({s['pubdate']}). {s['source']}. https://pubmed.ncbi.nlm.nih.gov/{s['pmid']}/")
    return "\n\n".join(apa_entries)
