"use client";

import { useState, useRef, useEffect } from "react";
import { 
  Search, ArrowUp, ExternalLink, CheckCircle2, 
  Plus, Home as HomeIcon, Filter, Database, Scale, Table as TableIcon, FileText, 
  Sparkles, Check, ChevronRight, Menu, X, BookOpen, Download, Copy, CheckCheck,
  ShieldCheck, FileSearch, MessageSquare, History, Bookmark, Share2, CornerDownRight,
  SlidersHorizontal, ChevronDown, ListChecks, ArrowRight, Lightbulb
} from "lucide-react";

export default function Home() {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [activeReport, setActiveReport] = useState<any | null>(null);
  const [historyItems, setHistoryItems] = useState<string[]>([
    "Clinical report on SGLT2 inhibitors",
    "Comparative analysis of SSRIs in adolescents",
    "Vitamin D fracture risk meta-analysis"
  ]);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedStudy, setSelectedStudy] = useState<any | null>(null);
  const [copiedPmid, setCopiedPmid] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"report" | "references">("report");
  const bottomScrollRef = useRef<HTMLDivElement>(null);

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "https://evidexai.onrender.com";

  const handleSearch = async (searchQuery?: string) => {
    const q = searchQuery || query;
    if (!q.trim()) return;
    setQuery("");
    setLoading(true);
    setSelectedStudy(null);

    // Add to history
    if (!historyItems.includes(q)) {
      setHistoryItems(prev => [q, ...prev.slice(0, 8)]);
    }

    try {
      const res = await fetch(`${apiUrl}/api/search?q=${encodeURIComponent(q)}`);
      const json = await res.json();
      setActiveReport({
        query: q,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        ...json
      });
      setTimeout(() => {
        bottomScrollRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 200);
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

  const reportData = activeReport?.summary || {};

  return (
    <div className="flex h-screen w-screen bg-[#fafafa] text-slate-900 font-sans overflow-hidden antialiased">
      
      {/* Mobile Backdrop */}
      {sidebarOpen && (
        <div 
          onClick={() => setSidebarOpen(false)} 
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-40 lg:hidden transition-opacity" 
        />
      )}

      {/* 1. LEFT WORKSPACE SIDEBAR (Consensus App Styled) */}
      <aside className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-[#f7f7f8] border-r border-slate-200 flex flex-col justify-between transition-transform duration-300 ${sidebarOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full lg:translate-x-0"}`}>
        
        <div className="flex flex-col h-full overflow-hidden p-3.5 space-y-4">
          
          {/* Logo Bar */}
          <div className="flex items-center justify-between px-1.5 pt-1">
            <div className="flex items-center gap-2 font-bold text-slate-900 text-sm tracking-tight">
              <span className="w-5 h-5 rounded-md bg-[#0080ff] text-white flex items-center justify-center text-xs font-black">E</span>
              <span>Evidex</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-100 text-[#0080ff] font-semibold">Pro</span>
            </div>
            <button onClick={() => setSidebarOpen(false)} className="lg:hidden p-1 rounded-md text-slate-400 hover:text-slate-800">
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* New Thread Button */}
          <button 
            onClick={() => { setActiveReport(null); setSidebarOpen(false); }}
            className="flex items-center gap-2.5 w-full px-3 py-2 rounded-xl bg-white border border-slate-200/80 hover:bg-slate-100 text-xs font-semibold text-slate-700 shadow-2xs transition-all"
          >
            <Plus className="w-4 h-4 text-[#0080ff]" />
            <span>New Thread</span>
          </button>

          {/* Navigation Links */}
          <nav className="space-y-0.5 text-xs font-medium text-slate-600">
            <button 
              onClick={() => { setActiveReport(null); setSidebarOpen(false); }}
              className="flex items-center gap-2.5 w-full px-2.5 py-2 rounded-lg hover:bg-slate-200/50 text-slate-700"
            >
              <HomeIcon className="w-4 h-4 text-slate-500" />
              <span>Home</span>
            </button>
            <button className="flex items-center gap-2.5 w-full px-2.5 py-2 rounded-lg hover:bg-slate-200/50">
              <Bookmark className="w-4 h-4 text-slate-500" />
              <span>My Library</span>
            </button>
            <button className="flex items-center gap-2.5 w-full px-2.5 py-2 rounded-lg hover:bg-slate-200/50">
              <History className="w-4 h-4 text-slate-500" />
              <span>Search History</span>
            </button>
          </nav>

          {/* Recents Thread List */}
          <div className="flex-1 overflow-y-auto space-y-1 pt-3 border-t border-slate-200/70">
            <span className="px-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">Recents</span>
            {historyItems.map((item, idx) => (
              <button
                key={idx}
                onClick={() => { handleSearch(item); setSidebarOpen(false); }}
                className="flex items-center gap-2 w-full px-2.5 py-2 rounded-lg text-xs text-slate-600 hover:text-slate-900 hover:bg-slate-200/60 text-left truncate transition-colors group"
              >
                <MessageSquare className="w-3.5 h-3.5 text-slate-400 group-hover:text-[#0080ff] shrink-0" />
                <span className="truncate">{item}</span>
              </button>
            ))}
          </div>

        </div>

        {/* User Footer */}
        <div className="p-3 border-t border-slate-200 bg-white/50 text-xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-teal-600 text-white flex items-center justify-center font-bold text-[10px]">
                DR
              </div>
              <span className="font-semibold text-slate-800 text-[11px]">Clinical Pro</span>
            </div>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-semibold">Active</span>
          </div>
        </div>

      </aside>

      {/* 2. MAIN CHAT & REPORT VIEWPORT */}
      <div className="flex-1 flex flex-col h-full overflow-hidden bg-white">
        
        {/* Top Minimal Navigation Bar */}
        <header className="h-12 border-b border-slate-200/80 px-4 flex items-center justify-between shrink-0 bg-white/95 backdrop-blur-md z-20">
          <div className="flex items-center gap-2">
            <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-1.5 rounded-md text-slate-600 hover:bg-slate-100">
              <Menu className="w-4 h-4" />
            </button>
            <span className="text-xs font-bold text-slate-800 truncate max-w-xs sm:max-w-md">
              {activeReport ? activeReport.query : "Clinical Consensus Report Workspace"}
            </span>
          </div>

          <div className="flex items-center gap-2 text-xs">
            {activeReport && (
              <>
                <button 
                  onClick={() => setActiveTab(activeTab === "report" ? "references" : "report")}
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 font-medium"
                >
                  <BookOpen className="w-3.5 h-3.5 text-[#0080ff]" />
                  <span>{activeTab === "report" ? `References (${activeReport.total_studies_scanned})` : "View Report"}</span>
                </button>
                <button 
                  onClick={() => alert("Report link copied to clipboard")}
                  className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-600"
                >
                  <Share2 className="w-3.5 h-3.5" />
                </button>
              </>
            )}
          </div>
        </header>

        {/* Scrollable Document & Chat Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-8 max-w-4xl mx-auto w-full space-y-6">
          
          {/* Initial Blank State (Consensus Style Prompt Starters) */}
          {!activeReport && !loading && (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-6 max-w-lg mx-auto">
              <div className="w-10 h-10 rounded-2xl bg-[#0080ff] text-white flex items-center justify-center font-black text-lg shadow-md">
                E
              </div>
              <div className="space-y-2">
                <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Clinical Report AI</h2>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Synthesizes 35M+ PubMed clinical trials into formal peer-reviewed reports, comparison matrices, and statistical consensus appraisals.
                </p>
              </div>

              {/* Starter Query Cards */}
              <div className="grid grid-cols-1 gap-2 w-full text-left pt-2">
                {[
                  "Clinical report on SGLT2 inhibitors vs GLP-1 agonists",
                  "Duration of dual antiplatelet therapy after stent placement",
                  "Consensus on intermittent fasting vs calorie restriction"
                ].map((item, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSearch(item)}
                    className="flex items-center justify-between p-3 rounded-xl border border-slate-200 hover:border-[#0080ff] bg-slate-50/50 hover:bg-white text-xs text-slate-700 font-medium transition-all group"
                  >
                    <span>{item}</span>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-[#0080ff]" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Active Report Rendering */}
          {activeReport && activeTab === "report" && (
            <div className="space-y-8 animate-in fade-in duration-300 pb-20">
              
              {/* User Chat Query Bubble */}
              <div className="flex justify-end">
                <div className="bg-[#0080ff] text-white px-4 py-2 rounded-2xl rounded-tr-xs text-xs font-semibold max-w-md shadow-xs">
                  {activeReport.query}
                </div>
              </div>

              {/* Pro Status Metadata Bar */}
              <div className="flex items-center gap-2 text-xs text-slate-500 bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                <span className="font-bold text-[#0080ff] uppercase tracking-wide text-[10px] bg-blue-50 px-2 py-0.5 rounded">Pro Synthesis</span>
                <span>•</span>
                <span>PubMed Corpus ({activeReport.total_studies_scanned} Trials Analyzed)</span>
                <span>•</span>
                <span className="text-emerald-700 font-medium">Inline Verified Citations</span>
              </div>

              {/* Consensus Bar */}
              {reportData.consensus && (
                <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-2 shadow-2xs">
                  <div className="flex items-center justify-between text-xs font-bold">
                    <span className="text-slate-800 uppercase tracking-wider">Research Consensus Meter</span>
                    <span className="text-emerald-600">{reportData.consensus.yes}% Positive Agreement</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-100 flex overflow-hidden border border-slate-200">
                    <div className="bg-emerald-500 h-full" style={{ width: `${reportData.consensus.yes}%` }} />
                    <div className="bg-slate-300 h-full" style={{ width: `${reportData.consensus.inconclusive}%` }} />
                    <div className="bg-rose-400 h-full" style={{ width: `${reportData.consensus.no}%` }} />
                  </div>
                </div>
              )}

              {/* H1 Document Title */}
              <div className="space-y-1">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                  {reportData.title || activeReport.query}
                </h1>
                <p className="text-xs text-slate-400">Synthesized from indexed multi-center randomized controlled trials.</p>
              </div>

              {/* 1. Summary Narrative */}
              <div className="space-y-3">
                <p className="text-sm sm:text-base text-slate-800 leading-relaxed">
                  {reportData.summary_narrative}
                </p>
              </div>

              {/* 2. Definition and Structure */}
              {reportData.definition_and_structure && (
                <div className="space-y-3">
                  <h3 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-1">
                    Definition and Structure
                  </h3>
                  <p className="text-sm text-slate-700 leading-relaxed">
                    {reportData.definition_and_structure}
                  </p>
                </div>
              )}

              {/* 3. Consensus Academic Table */}
              {reportData.table && (
                <div className="space-y-3">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 flex items-center gap-1.5">
                    <TableIcon className="w-4 h-4 text-[#0080ff]" /> Structural Breakdown & Observations
                  </h3>
                  <div className="border border-slate-200 rounded-xl overflow-hidden shadow-2xs overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold uppercase tracking-wider text-[10px]">
                        <tr>
                          {reportData.table.columns.map((col: string, idx: number) => (
                            <th key={idx} className="p-3 font-bold">{col}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-slate-700">
                        {reportData.table.rows.map((row: string[], idx: number) => (
                          <tr key={idx} className="hover:bg-slate-50/50">
                            <td className="p-3 font-semibold text-slate-900">{row[0]}</td>
                            <td className="p-3 text-slate-600">{row[1]}</td>
                            <td className="p-3 font-mono text-[#0080ff] text-[11px] whitespace-nowrap">{row[2]}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* 4. Merits and Limitations */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* Merits */}
                <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Key Clinical Merits
                  </h4>
                  <ul className="space-y-1.5 text-xs text-slate-700">
                    {reportData.key_merits?.map((m: string, i: number) => (
                      <li key={i} className="flex items-start gap-1.5">
                        <span className="text-emerald-500 font-bold">•</span>
                        <span>{m}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Limitations */}
                <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-amber-600" /> Limitations & Bias Risk
                  </h4>
                  <ul className="space-y-1.5 text-xs text-slate-700">
                    {reportData.limitations_and_biases?.map((l: string, i: number) => (
                      <li key={i} className="flex items-start gap-1.5">
                        <span className="text-amber-500 font-bold">•</span>
                        <span>{l}</span>
                      </li>
                    ))}
                  </ul>
                </div>

              </div>

              {/* 5. Future Directions */}
              {reportData.future_directions && (
                <div className="space-y-2 p-4 rounded-xl border border-slate-200 bg-white">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                    Contemporary Role and Future Directions
                  </h4>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {reportData.future_directions}
                  </p>
                </div>
              )}

              {/* Suggested Follow-up Prompts (Like Consensus) */}
              {reportData.suggested_followups && (
                <div className="space-y-2 pt-4 border-t border-slate-200">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                    <Lightbulb className="w-3.5 h-3.5 text-amber-500" /> Suggested Follow-ups
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {reportData.suggested_followups.map((sug: string, i: number) => (
                      <button
                        key={i}
                        onClick={() => handleSearch(sug)}
                        className="px-3 py-1.5 rounded-full border border-slate-200 bg-white hover:border-[#0080ff] hover:bg-blue-50/30 text-xs text-slate-700 transition-all text-left"
                      >
                        {sug}
                      </button>
                    ))}
                  </div>
                </div>
              )}

            </div>
          )}

          {/* Tab 2: Studies References Drawer */}
          {activeReport && activeTab === "references" && (
            <div className="space-y-4 animate-in fade-in duration-200 pb-20">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                Indexed Studies & Methodological Audits ({activeReport.total_studies_scanned})
              </h3>
              
              <div className="space-y-3">
                {activeReport.studies?.map((item: any) => (
                  <div
                    key={item.pmid}
                    onClick={() => setSelectedStudy(item)}
                    className="p-4 rounded-xl border border-slate-200 bg-white hover:border-[#0080ff] transition-all cursor-pointer space-y-2 shadow-2xs"
                  >
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 text-[10px] font-bold">
                        {item.badge}
                      </span>
                      <span className="text-[11px] text-slate-400 font-mono">PMID: {item.pmid}</span>
                      {item.statistics?.p_value && (
                        <span className="text-[10px] text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded font-mono">
                          {item.statistics.p_value}
                        </span>
                      )}
                    </div>
                    <h4 className="text-sm font-semibold text-slate-900 leading-snug">{item.title}</h4>
                    <p className="text-xs text-slate-500 line-clamp-2">{item.abstract}</p>
                    <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs text-slate-500">
                      <span>{item.source} ({item.pubdate})</span>
                      <button 
                        onClick={(e) => copyCitation(item.pmid, e)}
                        className="flex items-center gap-1 text-[#0080ff] hover:underline"
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

          {/* Loading Indicator */}
          {loading && (
            <div className="flex flex-col items-center justify-center p-12 space-y-3">
              <div className="w-6 h-6 border-2 border-[#0080ff] border-t-transparent rounded-full animate-spin" />
              <p className="text-xs text-slate-500 font-medium">Extracting PubMed abstracts and authoring structured report...</p>
            </div>
          )}

          <div ref={bottomScrollRef} />
        </div>

        {/* 3. BOTTOM DOCKED CHAT & FOLLOW-UP BAR (Consensus Style) */}
        <div className="p-3 sm:p-4 bg-white border-t border-slate-200 shrink-0">
          <div className="max-w-3xl mx-auto w-full">
            <div className="bg-slate-50 border border-slate-300 focus-within:border-[#0080ff] focus-within:ring-2 focus-within:ring-blue-100 rounded-2xl p-2 transition-all shadow-xs flex items-center gap-2">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                placeholder={activeReport ? "Ask a follow-up question or request deeper analysis..." : "Ask a clinical question (e.g. Clinical report on SGLT2 inhibitors)..."}
                className="flex-1 bg-transparent text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none px-2 min-w-0"
              />
              <button
                onClick={() => handleSearch()}
                disabled={loading || !query.trim()}
                className="w-8 h-8 rounded-xl bg-[#0080ff] text-white flex items-center justify-center hover:bg-[#0070e0] transition-all disabled:opacity-30 shrink-0"
              >
                <ArrowUp className="w-4 h-4" />
              </button>
            </div>
            <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1.5 px-2">
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1 font-medium text-slate-600">
                  <Database className="w-3 h-3 text-[#0080ff]" /> Corpus: PubMed Human
                </span>
                <span className="hidden sm:inline">Model: Medical Synthesis Engine</span>
              </div>
              <span className="text-[10px] text-slate-400">Press Enter to synthesize</span>
            </div>
          </div>
        </div>

      </div>

      {/* 4. IN-APP CLINICAL STUDY READER MODAL */}
      {selectedStudy && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[88vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden text-left">
            <div className="p-4 sm:p-5 border-b border-slate-100 flex items-start justify-between bg-slate-50">
              <div className="space-y-1 pr-4">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-700 text-[10px] font-bold">
                    {selectedStudy.badge}
                  </span>
                  <span className="text-[11px] text-slate-500 font-mono">PMID: {selectedStudy.pmid}</span>
                </div>
                <h3 className="text-base font-bold text-slate-900 leading-snug">{selectedStudy.title}</h3>
                <p className="text-xs text-slate-500">{selectedStudy.source} ({selectedStudy.pubdate})</p>
              </div>
              <button onClick={() => setSelectedStudy(null)} className="p-1 rounded text-slate-400 hover:text-slate-800">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 overflow-y-auto space-y-4 text-xs sm:text-sm text-slate-700 leading-relaxed">
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 mb-1">Clinical Abstract</h4>
                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200/80 whitespace-pre-line">
                  {selectedStudy.abstract}
                </div>
              </div>
              <div className="p-3 rounded-xl border border-slate-200 bg-slate-50">
                <h4 className="text-xs font-bold text-slate-900 mb-0.5">Commercial COI Audit</h4>
                <p className="text-xs text-slate-600">{selectedStudy.funding_audit?.coi_statement || "No conflicts declared."}</p>
              </div>
            </div>

            <div className="p-4 border-t border-slate-100 flex justify-end bg-slate-50/50">
              <button
                onClick={(e) => copyCitation(selectedStudy.pmid, e)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-slate-300 text-slate-700 text-xs font-semibold hover:bg-slate-100 shadow-2xs"
              >
                {copiedPmid === selectedStudy.pmid ? <CheckCheck className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-slate-500" />}
                <span>{copiedPmid === selectedStudy.pmid ? "Copied" : "Copy Citation"}</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
