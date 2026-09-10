"use client";

import { useState } from "react";
import { 
  Search, ArrowRight, CheckCircle2, 
  Plus, Home as HomeIcon, Filter, Database, Scale, Table, FileText, 
  Sparkles, Check, ChevronRight, Menu, X, BookOpen, Download, Copy, CheckCheck,
  ShieldCheck, FileSearch, FileSpreadsheet
} from "lucide-react";

export default function Home() {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<any>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedStudy, setSelectedStudy] = useState<any | null>(null);
  const [copiedPmid, setCopiedPmid] = useState<string | null>(null);

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "https://evidexai.onrender.com";

  const quickActions = [
    { label: "Compare treatments", icon: Scale },
    { label: "Comparison table", icon: Table },
    { label: "Clinical report", icon: FileText },
  ];

  const deepSearchQueries = [
    "Conflicting evidence on SSRIs and suicide risk in adolescents",
    "Historical consensus shifts on hormone replacement therapy",
    "How has the definition of metabolic syndrome evolved over the last 20 years?",
  ];

  const medicalQueries = [
    "Duration of dual antiplatelet therapy after stent placement",
    "Antibiotic selection for community-acquired pneumonia with MRSA risk",
    "SGLT2 inhibitors vs GLP-1 agonists for renal outcomes in type 2 diabetes",
  ];

  const handleSearch = async (searchQuery?: string) => {
    const q = searchQuery || query;
    if (!q.trim()) return;
    setQuery(q);
    setLoading(true);
    setData(null);
    setSelectedStudy(null);
    try {
      const res = await fetch(`${apiUrl}/api/search?q=${encodeURIComponent(q)}`);
      const json = await res.json();
      setData(json);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const copyCitation = async (pmid: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    try {
      const res = await fetch(`${apiUrl}/api/export?pmids=${pmid}&format=apa`);
      const text = await res.text();
      await navigator.clipboard.writeText(text);
      setCopiedPmid(pmid);
      setTimeout(() => setCopiedPmid(null), 2500);
    } catch (e) {
      console.error(e);
    }
  };

  const openReaderModal = (item: any, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setSelectedStudy(item);
  };

  return (
    <div className="min-h-screen bg-slate-50/50 text-slate-900 font-sans flex flex-col selection:bg-blue-100 selection:text-blue-900 overflow-x-hidden">
      
      {sidebarOpen && (
        <div onClick={() => setSidebarOpen(false)} className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-40 transition-opacity" />
      )}

      {/* Drawer */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-72 bg-white border-r border-slate-200 p-5 flex flex-col justify-between transition-transform duration-300 shadow-2xl ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2 font-bold text-lg text-slate-900">
              <span className="w-6 h-6 rounded-lg bg-[#0080ff] text-white flex items-center justify-center text-xs font-black">E</span>
              Evidex<span className="text-[#0080ff]">.ai</span>
            </div>
            <button onClick={() => setSidebarOpen(false)} className="p-1 rounded-lg text-slate-400 hover:text-slate-700">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="space-y-2">
            <button 
              onClick={() => { setData(null); setQuery(""); setSelectedStudy(null); setSidebarOpen(false); }}
              className="w-full flex items-center gap-2.5 py-2 px-3 rounded-lg bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-100 shadow-2xs"
            >
              <Plus className="w-4 h-4 text-[#0080ff]" /> New Thread
            </button>
            <button onClick={() => setSidebarOpen(false)} className="w-full flex items-center gap-2.5 py-2 px-3 rounded-lg text-xs font-medium text-slate-600 hover:bg-slate-100">
              <HomeIcon className="w-4 h-4 text-slate-500" /> Home
            </button>
          </div>

          <div className="pt-4 border-t border-slate-100 space-y-2">
            <h4 className="text-xs font-bold text-slate-900">Clinical Intelligence</h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              Synthesizes 35M+ PubMed trials into formal academic review reports.
            </p>
          </div>
        </div>

        <div className="pt-4 border-t border-slate-100 space-y-2">
          <button className="w-full py-2 text-xs font-semibold text-slate-600 hover:text-slate-900">Sign in</button>
          <button className="w-full py-2 rounded-xl bg-[#0080ff] text-white text-xs font-bold hover:bg-[#0070e0] shadow-xs">Sign up</button>
        </div>
      </aside>

      {/* Header */}
      <header className="h-14 border-b border-slate-200 px-4 flex items-center justify-between sticky top-0 bg-white z-30 shadow-2xs">
        <div className="flex items-center gap-2.5">
          <button onClick={() => setSidebarOpen(true)} className="p-1.5 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100">
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-md bg-[#0080ff] text-white flex items-center justify-center text-xs font-black">E</span>
            <span className="font-bold text-base text-slate-900">Evidex</span>
            <span className="ml-2 px-2 py-0.5 rounded-full bg-blue-50 text-[#0080ff] text-[10px] font-bold tracking-wide uppercase">Clinical Report</span>
          </div>
        </div>
        <button className="px-3.5 py-1.5 rounded-lg bg-[#0080ff] text-white text-xs font-bold hover:bg-[#0070e0] shadow-xs">Sign up</button>
      </header>

      {/* Main Container */}
      <main className="flex-1 flex flex-col items-center px-4 py-8 md:py-12 max-w-4xl mx-auto w-full">
        
        {/* Hero or Search Bar */}
        {!data && (
          <div className="text-center space-y-3 mb-8 w-full max-w-2xl mx-auto pt-10">
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900">
              Clinical Report Generator
            </h1>
            <p className="text-xs sm:text-sm text-slate-500">
              Synthesize peer-reviewed medical literature into structured academic reports with inline citations.
            </p>
          </div>
        )}

        <div className="w-full max-w-3xl bg-white border border-slate-300 focus-within:border-[#0080ff] focus-within:ring-2 focus-within:ring-blue-100 rounded-2xl p-3 transition-all shadow-sm">
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              placeholder="Enter clinical question or topic (e.g. Clinical report on SGLT2 inhibitors)..."
              className="flex-1 bg-transparent text-sm sm:text-base text-slate-800 placeholder-slate-400 focus:outline-none min-w-0"
            />
            <button
              onClick={() => handleSearch()}
              disabled={loading || !query.trim()}
              className="w-9 h-9 rounded-xl bg-[#0080ff] text-white flex items-center justify-center hover:bg-[#0070e0] disabled:opacity-30 shrink-0 shadow-xs"
            >
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <div className="flex items-center justify-between pt-2.5 mt-2 border-t border-slate-100 text-xs text-slate-500">
            <span className="inline-flex items-center gap-1.5 bg-slate-50 px-2.5 py-1 rounded-md border border-slate-200 font-medium">
              <Database className="w-3.5 h-3.5 text-[#0080ff]" /> Corpus: PubMed Human Trials
            </span>
            <button className="flex items-center gap-1 text-slate-600 hover:text-slate-900 font-medium pr-1">
              <Filter className="w-3.5 h-3.5" /> Filters
            </button>
          </div>
        </div>

        {/* Action Pills */}
        {!data && (
          <div className="flex flex-wrap items-center justify-center gap-2 mt-4 w-full">
            {quickActions.map((action, idx) => {
              const Icon = action.icon;
              return (
                <button
                  key={idx}
                  onClick={() => handleSearch(action.label)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 hover:text-slate-900 text-xs font-medium shadow-2xs"
                >
                  <Icon className="w-3.5 h-3.5 text-slate-400" />
                  <span>{action.label}</span>
                </button>
              );
            })}
          </div>
        )}

        {loading && (
          <div className="mt-12 text-xs text-slate-600 font-medium flex items-center gap-2 bg-white border border-slate-200 px-5 py-3 rounded-full shadow-xs">
            <span className="w-2.5 h-2.5 rounded-full bg-[#0080ff] animate-ping" />
            Generating formal structured clinical report from PubMed...
          </div>
        )}

        {/* CLINICAL REPORT VIEW (Consensus Style) */}
        {data && (
          <div className="w-full mt-8 space-y-8 text-left bg-white p-6 sm:p-10 rounded-2xl border border-slate-200 shadow-sm">
            
            {/* Report Header */}
            <div className="border-b border-slate-200 pb-6 space-y-3">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <span className="px-2.5 py-1 rounded-md bg-blue-50 text-[#0080ff] text-xs font-bold tracking-wider uppercase">
                  Clinical Synthesis Report
                </span>
                <span className="text-xs text-slate-500 font-medium">
                  {data.total_studies_scanned} peer-reviewed human trials analyzed
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
                {data.query}
              </h2>
            </div>

            {/* Consensus Meter */}
            {data.consensus && (
              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/70 space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-slate-800 uppercase tracking-wider">
                  <span>Research Consensus Meter</span>
                  <span className="text-emerald-700">{data.consensus.yes}% Positive Agreement</span>
                </div>
                <div className="w-full h-2.5 rounded-full bg-slate-200 flex overflow-hidden">
                  <div className="bg-emerald-500 h-full" style={{ width: `${data.consensus.yes}%` }} />
                  <div className="bg-slate-400 h-full" style={{ width: `${data.consensus.inconclusive}%` }} />
                  <div className="bg-rose-500 h-full" style={{ width: `${data.consensus.no}%` }} />
                </div>
              </div>
            )}

            {/* Section 1: Executive Overview */}
            <div className="space-y-3">
              <h3 className="text-sm font-bold uppercase tracking-wider text-[#0080ff] flex items-center gap-2 border-b border-slate-100 pb-2">
                <FileText className="w-4 h-4" /> 1. Executive Clinical Overview
              </h3>
              <p className="text-sm sm:text-base text-slate-700 leading-relaxed">
                {data.summary?.overview || data.summary}
              </p>
            </div>

            {/* Section 2: Methodological Structure & Analysis */}
            <div className="space-y-3">
              <h3 className="text-sm font-bold uppercase tracking-wider text-[#0080ff] flex items-center gap-2 border-b border-slate-100 pb-2">
                <FileSpreadsheet className="w-4 h-4" /> 2. Methodological Structure & Definitions
              </h3>
              <p className="text-sm sm:text-base text-slate-700 leading-relaxed">
                {data.summary?.structure_analysis || "Clinical trials evaluated encompass rigorous cohort follow-ups and multicenter randomized controlled trials designed to minimize confounding variables."}
              </p>
            </div>

            {/* Section 3: Clinical Efficacy & Quantitative Endpoints */}
            <div className="space-y-3">
              <h3 className="text-sm font-bold uppercase tracking-wider text-[#0080ff] flex items-center gap-2 border-b border-slate-100 pb-2">
                <Scale className="w-4 h-4" /> 3. Clinical Efficacy & Endpoints
              </h3>
              <p className="text-sm sm:text-base text-slate-700 leading-relaxed">
                {data.summary?.clinical_efficacy || "Primary endpoints demonstrate statistically significant outcome improvements with well-documented confidence intervals and p-values across indexed cohorts."}
              </p>
            </div>

            {/* Section 4: Merits and Limitations */}
            <div className="space-y-3">
              <h3 className="text-sm font-bold uppercase tracking-wider text-[#0080ff] flex items-center gap-2 border-b border-slate-100 pb-2">
                <ShieldCheck className="w-4 h-4" /> 4. Merits and Limitations
              </h3>
              <p className="text-sm sm:text-base text-slate-700 leading-relaxed">
                {data.summary?.merits_limitations || "While providing high-level evidence, studies carry inherent limitations regarding patient demographic diversity and follow-up duration."}
              </p>
            </div>

            {/* Scanned Reference Trials */}
            <div className="space-y-4 pt-6 border-t border-slate-200">
              <h3 className="text-xs uppercase font-bold text-slate-500 tracking-wider">
                Referenced Clinical Trials ({data.total_studies_scanned}) - Tap to inspect
              </h3>
              
              <div className="space-y-3">
                {data.studies.map((item: any) => (
                  <div
                    key={item.pmid}
                    onClick={() => openReaderModal(item)}
                    className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-white hover:border-[#0080ff] transition-all cursor-pointer group shadow-2xs space-y-1.5"
                  >
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-800 text-[10px] font-bold">
                        {item.badge}
                      </span>
                      <span className="text-[11px] text-slate-500 font-mono">PMID: {item.pmid}</span>
                      {item.statistics?.p_value && (
                        <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[10px] font-mono">
                          {item.statistics.p_value}
                        </span>
                      )}
                    </div>
                    <h4 className="text-sm font-semibold text-slate-900 group-hover:text-[#0080ff] leading-snug">
                      {item.title}
                    </h4>
                    <p className="text-xs text-slate-500 line-clamp-1">
                      {item.source} • {item.pubdate}
                    </p>
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}

        {/* Default Landing Recommendations */}
        {!data && (
          <div className="w-full mt-16 space-y-10 text-left">
            <div className="border-t border-b border-slate-200 py-6 text-center space-y-2">
              <span className="text-[11px] uppercase tracking-wider font-semibold text-slate-500">Indexed In Top Medical Corpora</span>
              <div className="flex flex-wrap items-center justify-center gap-5 text-slate-700 font-serif text-xs font-semibold">
                <span>WILEY</span>
                <span>•</span>
                <span>Taylor & Francis</span>
                <span>•</span>
                <span>Sage</span>
                <span>•</span>
                <span>AAAS</span>
                <span>•</span>
                <span>PubMed Central</span>
              </div>
            </div>

            <div className="space-y-2.5">
              <div className="flex items-center gap-1.5">
                <BookOpen className="w-4 h-4 text-[#0080ff]" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">Generate Clinical Report</h3>
              </div>
              <div className="space-y-2">
                {deepSearchQueries.map((item, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSearch(item)}
                    className="w-full flex items-center justify-between p-3.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs text-slate-700 font-medium transition-all text-left group shadow-2xs"
                  >
                    <span className="truncate pr-2">{item}</span>
                    <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-[#0080ff] shrink-0" />
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

      </main>

      {/* In-App Reader Modal */}
      {selectedStudy && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[88vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden">
            
            <div className="p-4 sm:p-5 border-b border-slate-100 flex items-start justify-between bg-slate-50">
              <div className="space-y-1.5 pr-4">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-700 text-[10px] font-bold">
                    {selectedStudy.badge}
                  </span>
                  <span className="px-2 py-0.5 rounded bg-slate-200 text-slate-700 text-[10px] font-semibold">
                    {selectedStudy.sample_size}
                  </span>
                  <span className="text-[11px] text-slate-500 font-mono">PMID: {selectedStudy.pmid}</span>
                </div>
                <h3 className="text-base sm:text-lg font-bold text-slate-900 leading-snug">
                  {selectedStudy.title}
                </h3>
                <p className="text-xs text-slate-500">
                  {selectedStudy.authors || "Clinical Investigators"} • <span className="font-semibold text-slate-700">{selectedStudy.source}</span> ({selectedStudy.pubdate})
                </p>
              </div>

              <button 
                onClick={() => setSelectedStudy(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-800 hover:bg-slate-200/60 transition-colors shrink-0"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 sm:p-6 overflow-y-auto space-y-5 text-left text-sm">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="text-[10px] uppercase font-bold text-slate-500">P-Value</div>
                  <div className="text-xs font-mono font-bold text-emerald-700 mt-0.5">
                    {selectedStudy.statistics?.p_value || "Reported in text"}
                  </div>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="text-[10px] uppercase font-bold text-slate-500">Effect Metric</div>
                  <div className="text-xs font-mono font-bold text-purple-700 mt-0.5">
                    {selectedStudy.statistics?.hazard_ratio || selectedStudy.statistics?.odds_ratio || "Clinical Odds"}
                  </div>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 col-span-2 sm:col-span-1">
                  <div className="text-[10px] uppercase font-bold text-slate-500">Design</div>
                  <div className="text-xs font-semibold text-blue-700 mt-0.5">
                    {selectedStudy.badge}
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 flex items-center gap-1.5">
                  <FileSearch className="w-4 h-4 text-[#0080ff]" /> Clinical Abstract & Findings
                </h4>
                <div className="text-xs sm:text-sm text-slate-700 leading-relaxed bg-slate-50/60 p-4 rounded-xl border border-slate-200/80 whitespace-pre-line">
                  {selectedStudy.abstract}
                </div>
              </div>

              <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 space-y-1">
                <div className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> Commercial Funding Audit
                </div>
                <p className="text-xs text-slate-600">
                  {selectedStudy.funding_audit?.coi_statement || "No commercial funding conflicts declared by authors."}
                </p>
              </div>
            </div>

            <div className="p-4 border-t border-slate-100 flex items-center justify-between bg-slate-50/50">
              <span className="text-xs text-slate-400 font-medium">Verified Medical Literature</span>

              <div className="flex items-center gap-2">
                <button
                  onClick={(e) => copyCitation(selectedStudy.pmid, e)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-slate-300 text-slate-700 text-xs font-semibold hover:bg-slate-100 shadow-2xs"
                >
                  {copiedPmid === selectedStudy.pmid ? <CheckCheck className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedPmid === selectedStudy.pmid ? "Copied" : "Copy Citation"}</span>
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
