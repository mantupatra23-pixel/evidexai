"use client";

import { useState, useEffect } from "react";
import { 
  Plus, Home as HomeIcon, Menu, X, BookOpen, 
  Copy, Share2, ArrowRight, ArrowUp, Grid, HelpCircle, FileText, Sparkles
} from "lucide-react";

export default function Home() {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [report, setReport] = useState<any | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showReferences, setShowReferences] = useState(false);
  const [referenceTab, setReferenceTab] = useState<string>("ALL");
  const [copiedPmid, setCopiedPmid] = useState<string | null>(null);
  const [recentThreads, setRecentThreads] = useState<string[]>([
    "Evolution of the dopamine hypothesis in schizophrenia",
    "Does vitamin D supplementation prevent fractures in elderly?",
    "SGLT2 inhibitors mortality in heart failure",
    "Does aspirin prevent cardiovascular events?"
  ]);

  const loadingStepsList = [
    "Searching 35M+ PubMed & PMC human records...",
    "Filtering evidence by study design & relevance...",
    "Classifying RCTs, meta-analyses, and clinical trials...",
    "Synthesizing publication-grade consensus report..."
  ];

  useEffect(() => {
    let timer: any;
    if (loading) {
      setLoadingStep(0);
      timer = setInterval(() => {
        setLoadingStep((prev) => (prev < loadingStepsList.length - 1 ? prev + 1 : prev));
      }, 700);
    }
    return () => clearInterval(timer);
  }, [loading]);

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
  const funnel = rep.funnel || { retrieved: "145.3M", eligible: "2.8K", included: "100", steps: "21 steps" };
  const consensus = rep.consensus || { yes: 77, possibly: 15, mixed: 0, no: 8 };

  const filteredStudies = report?.studies?.filter((s: any) => {
    if (referenceTab === "ALL") return true;
    return s.evidence_relationship === referenceTab;
  }) || [];

  return (
    <div className="flex h-screen w-screen bg-[#f9fafb] text-slate-900 font-sans overflow-hidden antialiased">
      
      {/* 1. SIDEBAR */}
      <aside className={`fixed md:static inset-y-0 left-0 z-50 bg-[#f0f4f9] border-r border-slate-200 transition-all duration-200 flex flex-col justify-between ${sidebarOpen ? "w-64 p-3.5" : "w-0 p-0 overflow-hidden md:w-16 md:p-2.5"} shadow-xl md:shadow-none`}>
        <div className="space-y-4 flex flex-col h-full overflow-hidden">
          <div className="flex items-center justify-between px-1">
            {sidebarOpen && (
              <div className="flex items-center gap-2">
                <span className="w-7 h-7 rounded-lg bg-teal-600 text-white flex items-center justify-center font-black text-sm">E</span>
                <span className="font-bold text-slate-800 text-base">Evidex<span className="text-teal-600">.ai</span></span>
              </div>
            )}
            <button 
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-200"
            >
              <Menu className="w-5 h-5" />
            </button>
          </div>

          <button 
            onClick={() => { setReport(null); setQuery(""); }}
            className={`flex items-center gap-2.5 rounded-2xl bg-white border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-100 ${sidebarOpen ? "px-3.5 py-2.5 w-full" : "w-10 h-10 justify-center mx-auto"}`}
          >
            <Plus className="w-4 h-4 text-teal-600 shrink-0" />
            {sidebarOpen && <span>New Thread</span>}
          </button>

          {sidebarOpen && (
            <div className="flex-1 overflow-y-auto space-y-1 pt-3 border-t border-slate-200">
              <span className="px-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">Recent Inquiries</span>
              {recentThreads.map((t, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSearch(t)}
                  className="flex items-center gap-2 w-full px-2.5 py-2 rounded-xl text-xs text-slate-600 hover:text-slate-900 hover:bg-slate-200 text-left truncate group"
                >
                  <FileText className="w-3.5 h-3.5 text-slate-400 group-hover:text-teal-600 shrink-0" />
                  <span className="truncate">{t}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </aside>

      {/* 2. MAIN RESEARCH WORKSPACE */}
      <div className="flex-1 flex flex-col h-full overflow-hidden bg-white">
        
        <header className="h-12 border-b border-slate-200 px-4 flex items-center justify-between shrink-0 bg-white z-20">
          <div className="flex items-center gap-2">
            <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-1.5 rounded-lg text-slate-600 md:hidden">
              <Menu className="w-4 h-4" />
            </button>
            <span className="text-xs font-bold text-slate-800 truncate max-w-sm sm:max-w-md">
              {report ? report.query : "Clinical Consensus Report Engine"}
            </span>
          </div>

          <div className="flex items-center gap-2 text-xs">
            {report && (
              <button 
                onClick={() => setShowReferences(!showReferences)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border transition-all font-semibold ${showReferences ? "bg-teal-600 text-white border-teal-600" : "bg-slate-50 text-slate-700 border-slate-200"}`}
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>References ({report?.total_studies_scanned || 0})</span>
              </button>
            )}
          </div>
        </header>

        <div className="flex-1 flex overflow-hidden">
          
          <div className="flex-1 overflow-y-auto px-4 sm:px-12 py-8 max-w-4xl mx-auto w-full space-y-7 pb-32 text-left">
            
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
                    Synthesizes 35M+ PubMed human trials into publication-grade consensus reports, methodology tables, and visual evidence appraisals.
                  </p>
                </div>

                <div className="grid grid-cols-1 gap-2 w-full pt-2 text-left">
                  {[
                    "Evolution of the dopamine hypothesis in schizophrenia",
                    "Does vitamin D supplementation prevent fractures in elderly?",
                    "SGLT2 inhibitors mortality in heart failure"
                  ].map((item, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSearch(item)}
                      className="flex items-center justify-between p-3.5 rounded-2xl border border-slate-200 hover:border-teal-600 bg-slate-50 hover:bg-white text-xs text-slate-700 font-medium transition-all group"
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
                  <span className="bg-teal-50 text-teal-800 text-xs font-semibold px-4 py-2 rounded-full border border-teal-200">
                    {report.query}
                  </span>
                </div>

                {/* Funnel Badge */}
                <div className="p-4 rounded-2xl bg-[#f0f4f9] border border-slate-200 flex items-center justify-between flex-wrap gap-4 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-teal-600 animate-ping" />
                    <span className="font-bold text-slate-800">Deep Consensus ({funnel.steps})</span>
                  </div>
                  <div className="flex items-center gap-4 text-slate-600 font-medium font-mono">
                    <span>Retrieved: <strong className="text-slate-900">{funnel.retrieved}</strong></span>
                    <span>→</span>
                    <span>Eligible: <strong className="text-slate-900">{funnel.eligible}</strong></span>
                    <span>→</span>
                    <span>Included: <strong className="text-teal-700">{funnel.included}</strong></span>
                  </div>
                </div>

                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 leading-snug">
                  {rep.title || report.query}
                </h1>

                {/* 1. Introduction */}
                <div className="space-y-2">
                  <h2 className="text-sm font-bold uppercase tracking-wider text-teal-700 border-b border-slate-100 pb-1">
                    1. Introduction
                  </h2>
                  <p className="text-sm sm:text-base text-slate-800 leading-relaxed">
                    {rep.introduction}
                  </p>
                </div>

                {/* 2. Methods */}
                <div className="space-y-2">
                  <h2 className="text-sm font-bold uppercase tracking-wider text-teal-700 border-b border-slate-100 pb-1">
                    2. Methods & Search Strategy
                  </h2>
                  <p className="text-sm text-slate-700 leading-relaxed">
                    {rep.methods}
                  </p>
                </div>

                {/* 3. Consensus Breakdown */}
                <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-2.5">
                  <div className="flex items-center justify-between text-xs font-bold">
                    <span className="text-slate-800 uppercase tracking-wider">Research Consensus Breakdown</span>
                    <span className="text-teal-700 font-semibold">{consensus.yes}% Positive Agreement</span>
                  </div>
                  
                  <div className="w-full h-3 rounded-full bg-slate-100 flex overflow-hidden border border-slate-200">
                    <div className="bg-emerald-500 h-full transition-all" style={{ width: `${consensus.yes}%` }} />
                    <div className="bg-amber-400 h-full transition-all" style={{ width: `${consensus.possibly || 0}%` }} />
                    <div className="bg-slate-300 h-full transition-all" style={{ width: `${consensus.mixed || 0}%` }} />
                    <div className="bg-rose-500 h-full transition-all" style={{ width: `${consensus.no}%` }} />
                  </div>

                  <div className="grid grid-cols-4 text-center text-xs font-mono font-medium pt-1">
                    <span className="text-emerald-700">● {consensus.yes}% Yes</span>
                    <span className="text-amber-600">● {consensus.possibly || 0}% Possibly</span>
                    <span className="text-slate-600">● {consensus.mixed || 0}% Mixed</span>
                    <span className="text-rose-600">● {consensus.no}% No</span>
                  </div>
                </div>

                {/* 4. Results & Foundational Papers Table */}
                <div className="space-y-3">
                  <h2 className="text-sm font-bold uppercase tracking-wider text-teal-700 border-b border-slate-100 pb-1">
                    3. Results & Foundational Papers
                  </h2>
                  <p className="text-sm text-slate-700 leading-relaxed">
                    {rep.results}
                  </p>

                  <div className="border border-slate-200 rounded-xl overflow-hidden overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-[#f8fafc] border-b border-slate-200 text-slate-700 font-bold uppercase text-[10px]">
                        <tr>
                          <th className="p-3">Foundational Paper</th>
                          <th className="p-3">Milestone Summary</th>
                          <th className="p-3 whitespace-nowrap">Year / Citations</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-slate-700">
                        {(rep.foundational_papers || []).map((fp: any, idx: number) => (
                          <tr key={idx} className="hover:bg-slate-50">
                            <td className="p-3 font-semibold text-slate-900">{fp.paper} ({fp.author})</td>
                            <td className="p-3 text-slate-600">{fp.summary}</td>
                            <td className="p-3 font-mono text-[11px] text-teal-700 whitespace-nowrap">{fp.year} • {fp.citations} citations</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* 5. Claim-Level Evidence Strength Table */}
                <div className="space-y-3">
                  <h2 className="text-sm font-bold uppercase tracking-wider text-teal-700 border-b border-slate-100 pb-1">
                    Claim-Level Evidence Strength
                  </h2>
                  <div className="border border-slate-200 rounded-xl overflow-hidden overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-[#f8fafc] border-b border-slate-200 text-slate-700 font-bold uppercase text-[10px]">
                        <tr>
                          <th className="p-3">Claim</th>
                          <th className="p-3">Evidence Strength</th>
                          <th className="p-3">Clinical Reasoning</th>
                          <th className="p-3">Key Papers</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-slate-700">
                        {(rep.evidence_claims || []).map((item: any, idx: number) => (
                          <tr key={idx} className="hover:bg-slate-50">
                            <td className="p-3 font-semibold text-slate-900 min-w-[200px]">{item.claim}</td>
                            <td className="p-3 whitespace-nowrap">
                              <div className="flex items-center gap-1.5">
                                <div className="flex gap-0.5">
                                  {[...Array(10)].map((_, i) => (
                                    <span 
                                      key={i} 
                                      className={`w-1.5 h-3 rounded-2xs ${i < item.bars ? (item.bars >= 7 ? 'bg-emerald-500' : 'bg-amber-400') : 'bg-slate-200'}`}
                                    />
                                  ))}
                                </div>
                                <span className="text-[10px] font-bold text-slate-500 ml-1">{item.strength}</span>
                              </div>
                            </td>
                            <td className="p-3 text-slate-600 min-w-[200px]">{item.reasoning}</td>
                            <td className="p-3 font-mono text-[10px] text-teal-700 whitespace-nowrap">{item.papers}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* 6. Research Gaps Heatmap Matrix */}
                <div className="space-y-3">
                  <h2 className="text-sm font-bold uppercase tracking-wider text-teal-700 border-b border-slate-100 pb-1 flex items-center gap-1.5">
                    <Grid className="w-3.5 h-3.5" /> Evidence Density & Research Gaps
                  </h2>
                  <div className="border border-slate-200 rounded-xl overflow-hidden overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-[#f8fafc] border-b border-slate-200 text-slate-700 font-bold uppercase text-[10px]">
                        <tr>
                          <th className="p-3">Clinical Domain</th>
                          {(rep.research_gaps?.columns || ["RCT Evidence", "Biomarkers", "Early Cohort", "Registry"]).map((c: string, idx: number) => (
                            <th key={idx} className="p-3 text-center whitespace-nowrap">{c}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-slate-700">
                        {(rep.research_gaps?.rows || []).map((r: any, idx: number) => (
                          <tr key={idx}>
                            <td className="p-3 font-semibold text-slate-900 whitespace-nowrap">{r.domain}</td>
                            {r.counts.map((cnt: number, cIdx: number) => {
                              let bg = "bg-blue-50 text-blue-700 font-semibold";
                              if (cnt > 15) bg = "bg-blue-600 text-white font-bold";
                              else if (cnt >= 5) bg = "bg-blue-400 text-white font-semibold";
                              else if (cnt === 0) bg = "bg-slate-100 text-slate-400 italic";
                              return (
                                <td key={cIdx} className="p-2 text-center">
                                  <div className={`py-1 px-2.5 rounded text-xs mx-auto max-w-[85px] ${bg}`}>
                                    {cnt === 0 ? "No papers" : `${cnt} papers`}
                                  </div>
                                </td>
                              );
                            })}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* 7. Discussion */}
                <div className="space-y-2">
                  <h2 className="text-sm font-bold uppercase tracking-wider text-teal-700 border-b border-slate-100 pb-1">
                    4. Discussion & Limitations
                  </h2>
                  <p className="text-sm text-slate-700 leading-relaxed">
                    {rep.discussion}
                  </p>
                </div>

                {/* 8. Conclusion */}
                <div className="space-y-2">
                  <h2 className="text-sm font-bold uppercase tracking-wider text-teal-700 border-b border-slate-100 pb-1">
                    5. Conclusion
                  </h2>
                  <p className="text-sm text-slate-700 leading-relaxed">
                    {rep.conclusion}
                  </p>
                </div>

                {/* Open Research Questions */}
                <div className="space-y-3 pt-2">
                  <h2 className="text-sm font-bold uppercase tracking-wider text-teal-700 border-b border-slate-100 pb-1 flex items-center gap-1.5">
                    <HelpCircle className="w-3.5 h-3.5" /> Open Research Questions
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {(rep.open_questions || []).map((q: any, idx: number) => (
                      <div 
                        key={idx}
                        onClick={() => handleSearch(q.question)}
                        className="p-3.5 rounded-xl border border-slate-200 bg-white hover:border-teal-600 transition-all cursor-pointer group space-y-1.5"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <h4 className="text-xs font-bold text-slate-900 group-hover:text-teal-700 leading-snug">
                            {q.question}
                          </h4>
                          <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-teal-600 shrink-0" />
                        </div>
                        <p className="text-xs text-slate-500 leading-relaxed">{q.why}</p>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            )}

            {loading && (
              <div className="py-32 text-center space-y-4 max-w-sm mx-auto">
                <div className="w-8 h-8 border-2 border-teal-600 border-t-transparent rounded-full animate-spin mx-auto" />
                <div className="space-y-2">
                  <p className="text-xs font-bold text-teal-700 animate-pulse transition-all duration-300">
                    {loadingStepsList[loadingStep]}
                  </p>
                  <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                    <div 
                      className="bg-teal-600 h-full transition-all duration-500" 
                      style={{ width: `${((loadingStep + 1) / loadingStepsList.length) * 100}%` }} 
                    />
                  </div>
                </div>
              </div>
            )}

          </div>

          {/* References Drawer */}
          {report && showReferences && (
            <aside className="w-80 sm:w-96 border-l border-slate-200 bg-[#fbfbfb] flex flex-col h-full overflow-hidden shrink-0 text-left z-30 shadow-lg md:shadow-none animate-in slide-in-from-right duration-200">
              <div className="p-3.5 border-b border-slate-200 flex items-center justify-between text-xs bg-white">
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
                    className="p-3.5 rounded-xl border border-slate-200 bg-white hover:border-teal-600 transition-all space-y-2 text-left shadow-2xs"
                  >
                    <div className="flex items-center justify-between text-[11px] text-slate-500">
                      <span>{item.pubdate} • {item.citations_count} citations</span>
                      <span className="font-semibold text-slate-700 truncate max-w-[120px]">{item.authors}</span>
                    </div>

                    <h4 className="text-xs font-bold text-slate-900 leading-snug">
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
            </aside>
          )}

        </div>

        {/* 3. DOCKED CHAT BAR */}
        <div className="p-3 sm:p-4 bg-white border-t border-slate-200 shrink-0 z-20">
          <div className="max-w-3xl mx-auto w-full space-y-2">
            <div className="bg-[#f0f4f9] border border-slate-300 focus-within:border-teal-600 focus-within:ring-2 focus-within:ring-teal-100 rounded-2xl p-2 transition-all flex items-center gap-2">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                placeholder="Ask a follow-up or explore an open question..."
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
              <span className="text-[10px] text-slate-400 hidden sm:inline">Evidex Deep Research Engine</span>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
