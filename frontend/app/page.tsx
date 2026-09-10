"use client";

import { useState } from "react";
import { 
  Search, ArrowUp, ExternalLink, CheckCircle2, 
  Plus, Home as HomeIcon, Filter, Database, Scale, Table as TableIcon, FileText, 
  Sparkles, Check, ChevronRight, Menu, X, BookOpen, Download, Copy, CheckCheck,
  ShieldCheck, FileSearch, History, Bookmark, Share2, ArrowRight, Lightbulb
} from "lucide-react";

export default function Home() {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState<any | null>(null);
  const [selectedStudy, setSelectedStudy] = useState<any | null>(null);
  const [showReferencesPanel, setShowReferencesPanel] = useState(true);
  const [referenceTab, setReferenceTab] = useState<string>("ALL");
  const [copiedPmid, setCopiedPmid] = useState<string | null>(null);

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "https://evidexai.onrender.com";

  const handleSearch = async (searchQuery?: string) => {
    const q = searchQuery || query;
    if (!q.trim()) return;
    setLoading(true);
    setReport(null);
    try {
      const res = await fetch(`${apiUrl}/api/search?q=${encodeURIComponent(q)}`);
      const json = await res.json();
      setReport(json);
      if (json.studies && json.studies.length > 0) {
        setSelectedStudy(json.studies[0]);
      }
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

  const rep = report?.summary || {};
  const pico = rep.pico || {};

  const filteredStudies = report?.studies?.filter((s: any) => {
    if (referenceTab === "ALL") return true;
    return s.evidence_relationship === referenceTab;
  }) || [];

  return (
    <div className="flex h-screen w-screen bg-white text-slate-900 font-sans overflow-hidden antialiased">
      
      {/* 1. LEFT ICON RAIL */}
      <aside className="w-14 border-r border-slate-200 bg-[#fbfbfb] flex flex-col items-center py-3 justify-between shrink-0 z-30">
        <div className="space-y-4 flex flex-col items-center">
          <div className="w-8 h-8 rounded-lg bg-teal-600 text-white flex items-center justify-center font-black text-sm">
            E
          </div>
          <button onClick={() => setReport(null)} className="p-2 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-200/50" title="New Thread">
            <Plus className="w-5 h-5" />
          </button>
          <button onClick={() => setReport(null)} className="p-2 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-200/50" title="Home">
            <HomeIcon className="w-5 h-5" />
          </button>
          <button className="p-2 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-200/50" title="Library">
            <Bookmark className="w-5 h-5" />
          </button>
          <button className="p-2 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-200/50" title="History">
            <History className="w-5 h-5" />
          </button>
        </div>

        <div className="w-7 h-7 rounded-full bg-teal-700 text-white flex items-center justify-center text-xs font-bold">
          DR
        </div>
      </aside>

      {/* 2. DUAL-PANE MAIN WORKSPACE */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        
        {/* Top Header */}
        <header className="h-11 border-b border-slate-200 px-4 flex items-center justify-between shrink-0 bg-white z-20 text-xs">
          <div className="flex items-center gap-3">
            <span className="font-bold text-slate-800 truncate max-w-xs sm:max-w-md">
              {report ? report.query : "Clinical Report 2.0 Workspace"}
            </span>
            <span className="text-slate-400">▾</span>
          </div>

          <div className="flex items-center gap-2">
            <button 
              onClick={() => setShowReferencesPanel(!showReferencesPanel)}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-md border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 font-semibold"
            >
              <BookOpen className="w-3.5 h-3.5 text-teal-600" />
              <span>References ({report?.total_studies_scanned || 0})</span>
            </button>
            <button onClick={() => alert("Report link copied")} className="flex items-center gap-1 px-2 py-1 rounded-md border border-slate-200 text-slate-600 hover:bg-slate-50">
              <Share2 className="w-3.5 h-3.5" />
              <span>Share</span>
            </button>
          </div>
        </header>

        {/* Content Split: Left (Document) + Right (References Drawer) */}
        <div className="flex-1 flex overflow-hidden">
          
          {/* LEFT: CLINICAL REPORT 2.0 DOCUMENT */}
          <div className="flex-1 overflow-y-auto px-6 sm:px-12 py-8 max-w-3xl mx-auto w-full space-y-7 pb-28 text-left">
            
            {/* Initial Blank Screen */}
            {!report && !loading && (
              <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-6 max-w-lg mx-auto pt-10">
                <div className="flex items-center gap-2 font-bold text-xl text-slate-900">
                  <span className="w-6 h-6 rounded-full bg-teal-600 text-white flex items-center justify-center text-xs">E</span>
                  Evidex Clinical Report 2.0
                </div>
                <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">
                  Research starts here
                </h1>
                
                <div className="w-full bg-white border border-slate-300 focus-within:border-teal-600 rounded-2xl p-2.5 shadow-sm">
                  <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                    placeholder="Does vitamin D supplementation prevent fractures in elderly?..."
                    className="w-full bg-transparent text-sm focus:outline-none px-2 text-slate-800"
                  />
                  <div className="flex items-center justify-between pt-2 border-t border-slate-100 mt-2 text-xs text-slate-500">
                    <div className="flex items-center gap-2">
                      <span className="bg-slate-100 px-2 py-0.5 rounded font-medium">+ Corpus ▾</span>
                      <span className="bg-slate-100 px-2 py-0.5 rounded font-medium text-teal-700">Deep +</span>
                    </div>
                    <button onClick={() => handleSearch()} className="w-7 h-7 rounded-lg bg-teal-600 text-white flex items-center justify-center">
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 justify-center pt-2">
                  {[
                    "Does vitamin D supplementation prevent fractures in elderly?",
                    "SGLT2 inhibitors mortality in heart failure",
                    "Does aspirin prevent cardiovascular events?"
                  ].map((item, i) => (
                    <button
                      key={i}
                      onClick={() => handleSearch(item)}
                      className="px-3 py-1.5 rounded-full border border-slate-200 bg-white hover:bg-slate-50 text-xs text-slate-700 shadow-2xs text-left"
                    >
                      {item}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* CLINICAL REPORT 2.0 RENDER */}
            {report && (
              <div className="space-y-6">
                
                <div className="flex justify-end">
                  <span className="bg-blue-50 text-blue-800 text-xs font-semibold px-3 py-1.5 rounded-full">
                    {report.query}
                  </span>
                </div>

                {/* Executive Summary Cards */}
                <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-4 shadow-2xs">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider bg-teal-100 text-teal-800 px-2.5 py-1 rounded">
                      Executive Summary
                    </span>
                    <span className="text-xs font-semibold text-slate-600">
                      Evidence Strength: <strong className="text-teal-700">{rep.evidence_strength || "MODERATE"}</strong> (Confidence: {rep.evidence_confidence || 80}%)
                    </span>
                  </div>

                  <div className="space-y-1">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">Clinical Bottom Line</h3>
                    <p className="text-sm sm:text-base font-semibold text-slate-900 leading-snug">
                      {rep.clinical_bottom_line}
                    </p>
                  </div>

                  {/* PICO Framework Badges */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-slate-200/80 text-xs">
                    <div className="bg-white p-2 rounded-xl border border-slate-200">
                      <span className="text-[10px] uppercase font-bold text-teal-700 block">P: Population</span>
                      <span className="text-slate-700 font-medium truncate">{pico.population || "Older adults"}</span>
                    </div>
                    <div className="bg-white p-2 rounded-xl border border-slate-200">
                      <span className="text-[10px] uppercase font-bold text-teal-700 block">I: Intervention</span>
                      <span className="text-slate-700 font-medium truncate">{pico.intervention || "Supplementation"}</span>
                    </div>
                    <div className="bg-white p-2 rounded-xl border border-slate-200">
                      <span className="text-[10px] uppercase font-bold text-teal-700 block">C: Comparator</span>
                      <span className="text-slate-700 font-medium truncate">{pico.comparator || "Placebo"}</span>
                    </div>
                    <div className="bg-white p-2 rounded-xl border border-slate-200">
                      <span className="text-[10px] uppercase font-bold text-teal-700 block">O: Outcome</span>
                      <span className="text-slate-700 font-medium truncate">{pico.outcome || "Endpoints"}</span>
                    </div>
                  </div>
                </div>

                {/* Research Consensus Meter */}
                {report.consensus && (
                  <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-2">
                    <div className="flex items-center justify-between text-xs font-bold">
                      <span className="text-slate-800 uppercase tracking-wider">Research Consensus Meter</span>
                      <span className="text-teal-700">{report.consensus.no}% Against / Inconclusive</span>
                    </div>
                    <div className="w-full h-2.5 rounded-full bg-slate-100 flex overflow-hidden border border-slate-200">
                      <div className="bg-emerald-500 h-full" style={{ width: `${report.consensus.yes}%` }} />
                      <div className="bg-slate-400 h-full" style={{ width: `${report.consensus.inconclusive}%` }} />
                      <div className="bg-rose-500 h-full" style={{ width: `${report.consensus.no}%` }} />
                    </div>
                  </div>
                )}

                {/* Clinical Synthesis Narrative */}
                <div className="space-y-3">
                  <h2 className="text-lg font-bold text-slate-900">Clinical Synthesis</h2>
                  <p className="text-sm sm:text-base text-slate-800 leading-relaxed">
                    {rep.lead_narrative}
                  </p>
                </div>

                {/* Outcome Analysis Dashboard */}
                {rep.outcomes_breakdown && (
                  <div className="space-y-3 pt-2">
                    <h2 className="text-lg font-bold text-slate-900">Outcome Analysis Dashboard</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {rep.outcomes_breakdown.map((out: any, idx: number) => (
                        <div key={idx} className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-slate-900">{out.outcome}</span>
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800">{out.status}</span>
                          </div>
                          <p className="text-xs text-slate-600">{out.detail}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Evidence Table */}
                {rep.table && (
                  <div className="pt-2 space-y-2">
                    <h2 className="text-lg font-bold text-slate-900">Evidence Matrix Table</h2>
                    <div className="border border-slate-200 rounded-xl overflow-hidden shadow-2xs overflow-x-auto">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold uppercase text-[10px]">
                          <tr>
                            {rep.table.columns.map((c: string, idx: number) => (
                              <th key={idx} className="p-3 whitespace-nowrap">{c}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-slate-700">
                          {rep.table.rows.map((row: string[], idx: number) => (
                            <tr key={idx} className="hover:bg-slate-50/50">
                              {row.map((cell: string, cIdx: number) => (
                                <td key={cIdx} className="p-3 whitespace-nowrap text-slate-600">{cell}</td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* Population Analysis & Limitations */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-2">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900">Population Analysis</h4>
                    <p className="text-xs text-slate-600 leading-relaxed">{rep.population_analysis}</p>
                  </div>
                  <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-2">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900">Evidence Limitations</h4>
                    <p className="text-xs text-slate-600 leading-relaxed">{rep.limitations}</p>
                  </div>
                </div>

              </div>
            )}

            {loading && (
              <div className="py-24 text-center space-y-3">
                <div className="w-7 h-7 border-2 border-teal-600 border-t-transparent rounded-full animate-spin mx-auto" />
                <p className="text-xs text-slate-500 font-medium">Executing multi-stage retrieval and generating Clinical Report 2.0...</p>
              </div>
            )}

          </div>

          {/* RIGHT: REFERENCES DRAWER WITH TABS */}
          {report && showReferencesPanel && (
            <div className="w-80 sm:w-96 border-l border-slate-200 bg-[#fdfdfd] flex flex-col h-full overflow-hidden shrink-0 text-left">
              
              <div className="p-3 border-b border-slate-200 flex items-center justify-between text-xs bg-white">
                <div className="font-bold text-slate-800">
                  References <span className="text-slate-400 font-normal">({filteredStudies.length})</span>
                </div>
                <button onClick={() => setShowReferencesPanel(false)} className="text-slate-400 hover:text-slate-700">
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Filter Tabs */}
              <div className="flex border-b border-slate-200 bg-slate-50 text-[11px] font-semibold overflow-x-auto">
                {["ALL", "SUPPORTING", "CONTRADICTORY", "BACKGROUND"].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setReferenceTab(tab)}
                    className={`px-3 py-2 border-b-2 whitespace-nowrap transition-colors ${referenceTab === tab ? "border-teal-600 text-teal-700 bg-white" : "border-transparent text-slate-500 hover:text-slate-800"}`}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              <div className="flex-1 overflow-y-auto p-3 space-y-3">
                {filteredStudies.map((item: any) => (
                  <div
                    key={item.pmid}
                    onClick={() => setSelectedStudy(item)}
                    className={`p-3.5 rounded-xl border transition-all cursor-pointer space-y-2 text-left ${selectedStudy?.pmid === item.pmid ? "border-teal-600 bg-teal-50/20 shadow-xs" : "border-slate-200 bg-white hover:border-slate-300"}`}
                  >
                    <div className="flex items-center justify-between text-[11px] text-slate-500">
                      <span>{item.pubdate} • {item.citations_count} citations</span>
                      <span className="font-medium truncate max-w-[120px]">{item.authors}</span>
                    </div>

                    <h4 className="text-xs font-bold text-slate-900 leading-snug hover:text-teal-700">
                      {item.title}
                    </h4>

                    <div className="p-2 rounded-lg bg-slate-50 border border-slate-100 text-[11px] text-slate-600 leading-relaxed">
                      <span className="font-bold text-[10px] uppercase text-slate-400 block mb-0.5">Key Takeaway</span>
                      {item.key_takeaway}
                    </div>

                    <div className="flex items-center justify-between pt-1 text-[10px]">
                      <span className={`px-2 py-0.5 rounded font-bold uppercase ${item.evidence_relationship === "SUPPORTING" ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"}`}>
                        {item.evidence_relationship}
                      </span>
                      <button 
                        onClick={(e) => copyCitation(item.pmid, e)}
                        className="text-slate-500 hover:text-teal-700 flex items-center gap-1 font-medium"
                      >
                        <Copy className="w-3 h-3" />
                        <span>{copiedPmid === item.pmid ? "Copied" : "Cite"}</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>

            </div>
          )}

        </div>

        {/* 3. BOTTOM DOCKED CHAT BAR */}
        <div className="p-3 bg-white border-t border-slate-200 shrink-0 z-20">
          <div className="max-w-3xl mx-auto w-full space-y-1.5">
            <div className="bg-slate-50 border border-slate-300 focus-within:border-teal-600 focus-within:ring-2 focus-within:ring-teal-100 rounded-2xl p-2 transition-all flex items-center gap-2">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                placeholder="Ask a follow-up clinical question..."
                className="flex-1 bg-transparent text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none px-2 min-w-0"
              />
              <button
                onClick={() => handleSearch()}
                disabled={loading || !query.trim()}
                className="w-8 h-8 rounded-xl bg-teal-600 text-white flex items-center justify-center hover:bg-teal-700 transition-all disabled:opacity-30 shrink-0"
              >
                <ArrowUp className="w-4 h-4" />
              </button>
            </div>

            <div className="flex items-center justify-between text-[11px] text-slate-500 px-1">
              <div className="flex items-center gap-2">
                <span className="bg-slate-100 px-2 py-0.5 rounded font-medium text-slate-700">+ Corpus ▾</span>
                <span className="bg-slate-100 px-2 py-0.5 rounded font-medium text-teal-700 flex items-center gap-1">
                  <Database className="w-3 h-3" /> Deep +
                </span>
              </div>
              <span className="text-[10px] text-slate-400">Evidex Clinical Report 2.0 Engine</span>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
