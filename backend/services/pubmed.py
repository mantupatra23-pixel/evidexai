import xml.etree.ElementTree as ET
import httpx
import re

KNOWN_PHARMA = [
    "pfizer", "novartis", "roche", "merck", "astrazeneca", "abbvie", 
    "sanofi", "bristol-myers", "bms", "glaxosmithkline", "gsk", 
    "eli lilly", "lilly", "johnson & johnson", "janssen", "bayer", 
    "gilead", "amgen", "boehringer", "takeda", "novo nordisk", "moderna"
]

SYNONYM_MAP = {
    "high bp": "hypertension",
    "high blood pressure": "hypertension",
    "sugar": "type 2 diabetes mellitus",
    "heart attack": "myocardial infarction",
    "stroke": "cerebrovascular accident",
    "kidney disease": "chronic kidney disease",
    "kidney failure": "renal impairment OR renal failure",
    "weight loss": "obesity management OR weight reduction",
    "blood clot": "thrombosis OR thromboembolism",
    "cholesterol": "hyperlipidemia OR dyslipidemia"
}

def build_pubmed_clinical_query(user_query: str, min_year: int = None, max_year: int = None, study_type: str = None) -> str:
    processed = user_query.strip().lower()
    for slang, formal in SYNONYM_MAP.items():
        processed = re.sub(rf"\b{re.escape(slang)}\b", f"({formal})", processed)
    
    query = f"({processed}) AND (humans[Filter])"
    if min_year and max_year:
        query += f" AND ({min_year}:{max_year}[dp])"
    elif min_year:
        query += f" AND ({min_year}:3000[dp])"

    if study_type == "rct":
        query += " AND (randomized controlled trial[Publication Type])"
    elif study_type == "meta":
        query += " AND (meta-analysis[Publication Type] OR systematic review[Publication Type])"

    return query

def extract_quantitative_stats(abstract_text: str) -> dict:
    stats = {
        "p_value": None,
        "hazard_ratio": None,
        "odds_ratio": None,
        "confidence_interval": None
    }
    p_match = re.search(r"\b[pP]\s*([<=<]|value\s*[<=<])\s*([0-9]?\.[0-9]+|\b0\b)", abstract_text)
    if p_match:
        stats["p_value"] = f"p {p_match.group(1)} {p_match.group(2)}".replace("value", "").strip()

    hr_match = re.search(r"\b(HR|hazard ratio)\s*[:=]?\s*([0-9]+\.[0-9]+)", abstract_text, re.IGNORECASE)
    if hr_match:
        stats["hazard_ratio"] = f"HR {hr_match.group(2)}"

    or_match = re.search(r"\b(OR|odds ratio)\s*[:=]?\s*([0-9]+\.[0-9]+)", abstract_text, re.IGNORECASE)
    if or_match:
        stats["odds_ratio"] = f"OR {or_match.group(2)}"

    ci_match = re.search(r"\b(95%\s*CI|confidence interval)\s*[:=,]?\s*\[?([0-9]+\.[0-9]+)\s*(?:to|-|–)\s*([0-9]+\.[0-9]+)\]?", abstract_text, re.IGNORECASE)
    if ci_match:
        stats["confidence_interval"] = f"95% CI [{ci_match.group(2)}, {ci_match.group(3)}]"

    return stats

def parse_pubmed_xml(xml_text: str):
    studies = []
    try:
        root = ET.fromstring(xml_text)
        for article in root.findall(".//PubmedArticle"):
            pmid_node = article.find(".//MedlineCitation/PMID")
            pmid = pmid_node.text if pmid_node is not None else ""
            if not pmid:
                continue

            title_node = article.find(".//ArticleTitle")
            title = "".join(title_node.itertext()).strip() if title_node is not None else "Clinical Investigation"

            abstract_texts = article.findall(".//Abstract/AbstractText")
            abstract = " ".join(["".join(ab.itertext()).strip() for ab in abstract_texts]) if abstract_texts else "Abstract available via PubMed link."

            pub_types = [pt.text for pt in article.findall(".//PublicationTypeList/PublicationType") if pt.text]
            badge = "Clinical Study"
            if any("Randomized Controlled Trial" in pt for pt in pub_types):
                badge = "RCT"
            elif any("Meta-Analysis" in pt for pt in pub_types):
                badge = "Meta-Analysis"
            elif any("Systematic Review" in pt for pt in pub_types):
                badge = "Systematic Review"

            sample_match = re.search(r"\b(n\s*=\s*|\bcohort of\s*|\btotal of\s*)(\d+[\d,]*)\b", abstract, re.IGNORECASE)
            sample_size = f"N = {sample_match.group(2)}" if sample_match else "Peer-Reviewed"

            journal_node = article.find(".//Journal/ISOAbbreviation") or article.find(".//Journal/Title")
            source = journal_node.text if journal_node is not None else "PubMed Central"

            year_node = article.find(".//JournalIssue/PubDate/Year") or article.find(".//DateCompleted/Year")
            pubdate = year_node.text if year_node is not None else "Recent"

            # PMC ID detection
            pmc_id = None
            for article_id in article.findall(".//ArticleIdList/ArticleId"):
                if article_id.get("IdType") == "pmc":
                    raw_pmc = article_id.text.strip()
                    pmc_id = raw_pmc if raw_pmc.upper().startswith("PMC") else f"PMC{raw_pmc}"
                    break

            authors = []
            for author in article.findall(".//AuthorList/Author"):
                last = author.find("LastName")
                if last is not None and last.text:
                    authors.append(last.text)
            author_str = ", ".join(authors[:3]) + (" et al." if len(authors) > 3 else "") if authors else "Investigative Team"

            coi_node = article.find(".//CoiStatement")
            coi_text = "".join(coi_node.itertext()).strip() if coi_node is not None else ""
            grants = [g.find("Agency").text for g in article.findall(".//GrantList/Grant") if g.find("Agency") is not None and g.find("Agency").text]
            combined = f"{coi_text} {' '.join(grants)} {abstract}".lower()
            sponsors = list(set([p.title() for p in KNOWN_PHARMA if p in combined]))

            studies.append({
                "pmid": pmid,
                "pmc_id": pmc_id,
                "title": title,
                "authors": author_str,
                "abstract": abstract[:1200],
                "badge": badge,
                "sample_size": sample_size,
                "source": source,
                "pubdate": pubdate,
                "url": f"https://pubmed.ncbi.nlm.nih.gov/{pmid}/",
                "is_open_access": bool(pmc_id),
                "statistics": extract_quantitative_stats(abstract),
                "funding_audit": {
                    "bias_risk": "High" if len(sponsors) >= 2 else ("Moderate" if len(sponsors) == 1 else "Low (Independent)"),
                    "commercial_sponsors": sponsors,
                    "coi_statement": coi_text if coi_text else "No direct commercial conflicts declared by authors."
                }
            })
    except Exception as e:
        print(f"XML Parse Exception: {e}")
    return studies
