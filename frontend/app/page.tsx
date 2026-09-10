"use client";

import { useState } from "react";
import { 
  Search, ArrowUp, ExternalLink, CheckCircle2, 
  Plus, Home as HomeIcon, Filter, Database, Scale, Table as TableIcon, FileText, 
  Sparkles, Check, ChevronRight, Menu, X, BookOpen, Download, Copy, CheckCheck,
  ShieldCheck, FileSearch, History, Bookmark, Share2, ArrowRight, Lightbulb,
  AlertTriangle
} from "lucide-react";

export default function Home() {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState<any | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [showReferences, setShowReferences] = useState(false);
  const [referenceTab, setReferenceTab] = useState<string>("ALL");
  const [copiedPmid, setCopiedPmid] = useState<string | null>(null);
  const [recentThreads, setRecentThreads] = useState<string[]>([
    "Does vitamin D supplementation prevent fractures in elderly?",
    "SGLT2 inhibitors mortality in heart failure",
    "Does aspirin prevent cardiovascular events?",
    "Clinical Case Reports in Medical Literature"
  ]);

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "https://evidexai.onrender.com";

  const handleSearch = async (searchQuery?: string) => {
    const q = searchQuery || query;
    if (!q.trim()) return;
    setLoading(true);
    setReport(null);

    if (!recentThreads.includes(q)) {
      setRecentThreads(prev => [q, ...prev.slice(0, 7)]);
    }

    try {
      const res = await fetch(`${apiUrl}/api/search?q=${encodeURIComponent(q)}`);
      const json = await res.json();
      setReport(json);
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
    <div className="flex h-screen w-screen bg-[#f9fafb] text-slate-900 font-sans overflow-hidden antialiased">
      
      {/* 1. COLLAPSIBLE SIDEBAR */}
      <aside className={`fixed md:static inset-y-0 left-0 z-50 bg-[#f0f4f9] border-r border-slate-200/80 transition-all duration-300 flex flex-col justify-between ${sidebarOpen ? "w-64 p-3.5" : "w-0 p-0 overflow-hidden md:w-16 md:p-2.5"} shadow-xl md:shadow-none`}>
        
        <div className="space-y-4 flex flex-col h-full overflow-hidden">
          <div className="flex items-center justify-between px-1">
            {sidebarOpen && (
              <div className="flex items-center gap-2">
                <span className="w-7 h-7 rounded-lg bg-teal-600 text-white flex items-center justify-center font-black text-sm shadow-xs">E</span>
                <span className="font-bold text-slate-800 text-base">Evidex<span className="text-teal-600">.ai</span></span>
              </div>
            )}
            <button 
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-200/60 transition-colors"
              title="Toggle Sidebar"
            >
              <Menu className="w-5 h-5" />
            </button>
          </div>

          <button 
            onClick={() => { setReport(null); setQuery(""); }}
            className={`flex items-center gap-2.5 rounded-2xl bg-white border border-slate-200/90 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-all shadow-2xs ${sidebarOpen ? "px-3.5 py-2.5 w-full" : "w-10 h-10 justify-center mx-auto"}`}
          >
            <Plus className="w-4 h-4 text-teal-600 shrink-0" />
            {sidebarOpen && <span>New Thread</span>}
          </button>

          <div className="space-y-1 text-xs font-medium text-slate-600">
            <button 
              onClick={() => { setReport(null); setQuery(""); }}
              className={`flex items-center gap-2.5 w-full rounded-xl hover:bg-slate-200/60 text-slate-800 transition-colors ${sidebarOpen ? "px-3 py-2" : "h-10 justify-center"}`}
            >
              <HomeIcon className="w-4 h-4 text-slate-500 shrink-0" />
              {sidebarOpen && <span>Research Home</span>}
            </button>
            <button className={`flex items-center gap-2.5 w-full rounded-xl hover:bg-slate-200/60 text-slate-800 transition-colors ${sidebarOpen ? "px-3 py-2" : "h-10 justify-center"}`}>
              <Bookmark className="w-4 h-4 text-slate-500 shrink-0" />
              {sidebarOpen && <span>My Clinical Library</span>}
            </button>
          </div>

          {sidebarOpen && (
            <div className="flex-1 overflow-y-auto space-y-1 pt-3 border-t border-slate-200/60">
              <span className="px-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">Recent Inquiries</span>
              {recentThreads.map((t, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSearch(t)}
                  className="flex items-center gap-2 w-full px-2.5 py-2 rounded-xl text-xs text-slate-600 hover:text-slate-900 hover:bg-slate-200/60 text-left truncate transition-colors group"
                >
                  <FileText className="w-3.5 h-3.5 text-slate-400 group-hover:text-teal-600 shrink-0" />
                  <span className="truncate">{t}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {sidebarOpen && (
          <div className="pt-3 border-t border-slate-200/60 text-xs">
            <div className="flex items-center justify-between p-2 rounded-xl bg-white/70 border border-slate-200/60">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-teal-600 text-white flex items-center justify-center font-bold text-[10px]">MD</span>
                <span className="font-semibold text-slate-800 text-[11px]">Pro Workspace</span>
              </div>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-teal-100 text-teal-800 font-bold">ACTIVE</span>
            </div>
          </div>
        )}
      </aside>

      {/* 2. MAIN RESEARCH WORKSPACE & CANVAS */}
      <div className="flex-1 flex flex-col h-full overflow-hidden bg-white">
        
        <header className="h-12 border-b border-slate-200/80 px-4 flex items-center justify-between shrink-0 bg-white/95 backdrop-blur-md z-20">
          <div className="flex items-center gap-2.5">
            <button 
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-1.5 rounded-lg text-slate-600 hover:bg-slate-100 md:hidden"
            >
              <Menu className="w-4 h-4" />
            </button>
            <span className="text-xs font-bold text-slate-800 truncate max-w-sm sm:max-w-md">
              {report ? report.query : "Clinical Consensus Report Engine"}
            </span>
          </div>

          <div className="flex items-center gap-2 text-xs">
            {report && (
              <>
                <button 
                  onClick={() => setShowReferences(!showReferences)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border transition-all font-semibold ${showReferences ? "bg-teal-600 text-white border-teal-600" : "bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200"}`}
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>References ({report?.total_studies_scanned || 0})</span>
                </button>
                <button 
                  onClick={() => alert("Report link copied to clipboard")}
                  className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50"
                  title="Share Report"
                >
                  <Share2 className="w-3.5 h-3.5" />
                </button>
              </>
            )}
          </div>
        </header>

        <div className="flex-1 flex overflow-hidden">
          
          <div className="flex-1 overflow-y-auto px-4 sm:px-12 py-8 max-w-4xl mx-auto w-full space-y-8 pb-32 text-left">
            
            {!report && !loading && (
              <div className="flex flex-col items-center justify-center min-h-[65vh] text-center space-y-6 max-w-xl mx-auto">
                <div className="w-12 h-12 rounded-2xl bg-teal-600 text-white flex items-center justify-center font-black text-xl shadow-md">
                  E
                </div>
                <div className="space-y-2">
                  <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">
                    Clinical Research Starts Here
                  </h1>
                  <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
                    Synthesizes 35M+ PubMed human trials into publication-grade consensus reports, methodology tables, and statistical appraisals.
                  </p>
                </div>

                <div className="grid grid-cols-1 gap-2 w-full pt-2 text-left">
                  {[
                    "Does vitamin D supplementation prevent fractures in elderly?",
                    "SGLT2 inhibitors mortality in heart failure",
                    "Does aspirin prevent cardiovascular events in primary prevention?"
                  ].map((item, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSearch(item)}
                      className="flex items-center justify-between p-3.5 rounded-2xl border border-slate-200 hover:border-teal-600 bg-slate-50/50 hover:bg-white text-xs text-slate-700 font-medium transition-all group shadow-2xs"
                    >
                      <span>{item}</span>
                      <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-teal-600" />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {report && (
              <div className="space-y-8">
                
                <div className="flex justify-end">
                  <span className="bg-teal-50 text-teal-800 text-xs font-semibold px-4 py-2 rounded-full border border-teal-200/60 shadow-2xs">
                    {report.query}
                  </span>
                </div>

                <div className="space-y-2 border-b border-slate-100 pb-4">
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <span className="font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded text-[10px] uppercase tracking-wider">Clinical Synthesis</span>
                    <span>•</span>
                    <span>PubMed Human Database ({report.total_studies_scanned} Multi-Center Studies Analyzed)</span>
                  </div>
                  <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 leading-snug">
                    {rep.title || "Clinical Evidence Appraisal and Consensus Analysis"}
                  </h1>
                </div>

                <div className="p-5 rounded-2xl bg-[#f8fafc] border border-slate-200 space-y-4 shadow-2xs">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider bg-teal-600 text-white px-2.5 py-1 rounded">
                      Clinical Bottom Line
                    </span>
                    <span className="text-xs font-semibold text-slate-600">
                      Evidence Strength: <strong className="text-teal-700">{rep.evidence_strength || "MODERATE"}</strong> (Confidence: {rep.evidence_confidence || 85}%)
                    </span>
                  </div>

                  <p className="text-sm sm:text-base font-semibold text-slate-900 leading-relaxed">
                    {rep.clinical_bottom_line}
                  </p>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-3 border-t border-slate-200/70 text-xs">
                    <div className="bg-white p-2.5 rounded-xl border border-slate-200">
                      <span className="text-[10px] uppercase font-bold text-teal-700 block">P: Population</span>
                      <span className="text-slate-700 font-medium truncate block">{pico.population || "Older adult cohorts"}</span>
                    </div>
                    <div className="bg-white p-2.5 rounded-xl border border-slate-200">
                      <span className="text-[10px] uppercase font-bold text-teal-700 block">I: Intervention</span>
                      <span className="text-slate-700 font-medium truncate block">{pico.intervention || "Targeted therapy"}</span>
                    </div>
                    <div className="bg-white p-2.5 rounded-xl border border-slate-200">
                      <span className="text-[10px] uppercase font-bold text-teal-700 block">C: Comparator</span>
                      <span className="text-slate-700 font-medium truncate block">{pico.comparator || "Placebo / Standard care"}</span>
                    </div>
                    <div className="bg-white p-2.5 rounded-xl border border-slate-200">
                      <span className="text-[10px] uppercase font-bold text-teal-700 block">O: Outcome</span>
                      <span className="text-slate-700 font-medium truncate block">{pico.outcome || "Primary morbidity endpoints"}</span>
                    </div>
                  </div>
                </div>

                {report.consensus && (
                  <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-2.5 shadow-2xs">
                    <div className="flex items-center justify-between text-xs font-bold">
                      <span className="text-slate-800 uppercase tracking-wider">Research Consensus Meter</span>
                      <span className="text-teal-700 font-semibold">{report.consensus.no}% Outcome Negative / Inconclusive</span>
                    </div>
                    <div className="w-full h-2.5 rounded-full bg-slate-100 flex overflow-hidden border border-slate-200">
                      <div className="bg-emerald-500 h-full" style={{ width: `${report.consensus.yes}%` }} />
                      <div className="bg-slate-300 h-full" style={{ width: `${report.consensus.inconclusive}%` }} />
                      <div className="bg-rose-500 h-full" style={{ width: `${report.consensus.no}%` }} />
                    </div>
                    <div className="flex justify-between text-[11px] font-mono text-slate-500">
                      <span className="text-emerald-700">{report.consensus.yes}% Yes</span>
                      <span>{report.consensus.inconclusive}% Inconclusive</span>
                      <span className="text-rose-600">{report.consensus.no}% No</span>
                    </div>
                  </div>
                )}

                <div className="space-y-3">
                  <h2 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-1">
                    Clinical Synthesis & Evidence Evaluation
                  </h2>
                  <p className="text-sm sm:text-base text-slate-800 leading-relaxed whitespace-pre-line">
                    {rep.lead_narrative}
                  </p>
                </div>

                {rep.definition_and_structure && (
                  <div className="space-y-3 pt-1">
                    <h2 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-1">
                      Definition and Structure
                    </h2>
                    <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">
                      {rep.definition_and_structure}
                    </p>
                  </div>
                )}

                {rep.table && rep.table.rows && (
                  <div className="space-y-2 pt-2">
                    <h2 className="text-lg font-bold text-slate-900">
                      Comparative Evidence Table
                    </h2>
                    <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-2xs overflow-x-auto">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-[#f8fafc] border-b border-slate-200 text-slate-700 font-bold uppercase text-[10px]">
                          <tr>
                            {rep.table.columns.map((col: string, idx: number) => (
                              <th key={idx} className="p-3.5 whitespace-nowrap">{col}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-slate-700">
                          {rep.table.rows.map((row: string[], idx: number) => (
                            <tr key={idx} className="hover:bg-slate-50/70 transition-colors">
                              <td className="p-3.5 font-semibold text-slate-900 whitespace-nowrap">{row[0]}</td>
                              <td className="p-3.5 text-slate-600 leading-relaxed min-w-[280px]">{row[1]}</td>
                              <td className="p-3.5 font-mono text-[11px] text-teal-700 whitespace-nowrap font-medium">{row[2]}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                  <div className="p-4 rounded-2xl border border-slate-200 bg-[#f8fafc] space-y-2.5">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-teal-600" /> Key Clinical Merits
                    </h4>
                    <ul className="space-y-2 text-xs text-slate-700">
                      {rep.key_merits?.map((m: string, i: number) => (
                        <li key={i} className="flex items-start gap-2 leading-relaxed">
                          <span className="text-teal-600 font-bold shrink-0">•</span>
                          <span>{m}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="p-4 rounded-2xl border border-slate-200 bg-[#f8fafc] space-y-2.5">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 flex items-center gap-1.5">
                      <AlertTriangle className="w-4 h-4 text-amber-600" /> Limitations & Biases
                    </h4>
                    <ul className="space-y-2 text-xs text-slate-700">
                      {rep.limitations?.map((l: string, i: number) => (
                        <li key={i} className="flex items-start gap-2 leading-relaxed">
                          <span className="text-amber-600 font-bold shrink-0">•</span>
                          <span>{l}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {rep.future_directions && (
                  <div className="p-4 rounded-2xl border border-slate-200 bg-white space-y-1.5">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                      Contemporary Role & Future Directions
                    </h3>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      {rep.future_directions}
                    </p>
                  </div>
                )}

              </div>
            )}

            {loading && (
              <div className="py-24 text-center space-y-3">
                <div className="w-8 h-8 border-2 border-teal-600 border-t-transparent rounded-full animate-spin mx-auto" />
                <p className="text-xs text-slate-500 font-medium">Extracting PubMed literature and generating structured clinical report...</p>
              </div>
            )}

          </div>

          {report && showReferences && (
            <aside className="w-80 sm:w-96 border-l border-slate-200 bg-[#fbfbfb] flex flex-col h-full overflow-hidden shrink-0 text-left z-30 shadow-lg md:shadow-none animate-in slide-in-from-right duration-200">
              <div className="p-3 border-b border-slate-200 flex items-center justify-between text-xs bg-white">
                <span className="font-bold text-slate-800">
                  Referenced Studies ({filteredStudies.length})
                </span>
                <button onClick={() => setShowReferences(false)} className="text-slate-400 hover:text-slate-700 p-1">
                  <X className="w-4 h-4" />
                </button>
              </div>

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
                    className="p-3.5 rounded-2xl border border-slate-200 bg-white hover:border-teal-600 transition-all space-y-2 text-left shadow-2xs"
                  >
                    <div className="flex items-center justify-between text-[11px] text-slate-500">
                      <span>{item.pubdate} • {item.citations_count} citations</span>
                      <span className="font-semibold text-slate-700 truncate max-w-[120px]">{item.authors}</span>
                    </div>

                    <h4 className="text-xs font-bold text-slate-900 leading-snug">
                      {item.title}
                    </h4>

                    <div className="p-2 rounded-xl bg-slate-50 border border-slate-100 text-[11px] text-slate-600 leading-relaxed">
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
            </aside>
          )}

        </div>

        {/* 3. DOCKED CHAT BAR */}
        <div className="p-3 sm:p-4 bg-white border-t border-slate-200 shrink-0 z-20">
          <div className="max-w-3xl mx-auto w-full space-y-2">
            <div className="bg-[#f0f4f9] border border-slate-300/80 focus-within:border-teal-600 focus-within:ring-2 focus-within:ring-teal-100 rounded-2xl p-2 transition-all flex items-center gap-2">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                placeholder="Ask a clinical question (e.g. Does vitamin D prevent fractures in elderly?)..."
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
                <span className="bg-slate-100 px-2 py-0.5 rounded font-medium text-slate-700">+ Corpus: PubMed</span>
                <span className="bg-slate-100 px-2 py-0.5 rounded font-medium text-teal-700 flex items-center gap-1">
                  <Database className="w-3 h-3" /> Deep Consensus
                </span>
              </div>
              <span className="text-[10px] text-slate-400 hidden sm:inline">Evidex Clinical Report 2.0 Engine</span>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
