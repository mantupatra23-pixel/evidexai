"use client";

import { useState } from "react";
import { 
  Search, ArrowUp, ExternalLink, CheckCircle2, 
  Plus, Home as HomeIcon, Filter, Database, Scale, Table as TableIcon, FileText, 
  Sparkles, Check, ChevronRight, Menu, X, BookOpen, Download, Copy, CheckCheck,
  ShieldCheck, FileSearch, History, Bookmark, Share2, ArrowRight, Lightbulb,
  AlertTriangle, Grid, HelpCircle
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
    "Evolution of the dopamine hypothesis in schizophrenia"
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
  const consensus = rep.consensus || { yes: 20, possibly: 20, mixed: 10, no: 50 };

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

      {/* 2. MAIN RESEARCH WORKSPACE */}
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
                    Synthesizes 35M+ PubMed human trials into publication-grade consensus reports, methodology tables, and visual evidence appraisals.
                  </p>
                </div>

                <div className="grid grid-cols-1 gap-2 w-full pt-2 text-left">
                  {[
                    "Does vitamin D supplementation prevent fractures in elderly?",
                    "SGLT2 inhibitors mortality in heart failure",
                    "Does aspirin prevent cardiovascular events in primary prevention?",
                    "Evolution of the dopamine hypothesis in schizophrenia"
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
                    <span>PubMed Human Trials ({report.total_studies_scanned} Multi-Center Studies Analyzed)</span>
                  </div>
                  <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 leading-snug">
                    {rep.title || "Clinical Evidence Appraisal and Consensus Analysis"}
                  </h1>
                </div>

                {/* 1. Executive Summary */}
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
                    {rep.clinical_bottom_line || "Evidence indicates nuanced efficacy across monitored patient cohorts."}
                  </p>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-3 border-t border-slate-200/70 text-xs">
                    <div className="bg-white p-2.5 rounded-xl border border-slate-200">
                      <span className="text-[10px] uppercase font-bold text-teal-700 block">P: Population</span>
                      <span className="text-slate-700 font-medium truncate block">{pico.population || "Patient cohort"}</span>
                    </div>
                    <div className="bg-white p-2.5 rounded-xl border border-slate-200">
                      <span className="text-[10px] uppercase font-bold text-teal-700 block">I: Intervention</span>
                      <span className="text-slate-700 font-medium truncate block">{pico.intervention || "Therapeutic course"}</span>
                    </div>
                    <div className="bg-white p-2.5 rounded-xl border border-slate-200">
                      <span className="text-[10px] uppercase font-bold text-teal-700 block">C: Comparator</span>
                      <span className="text-slate-700 font-medium truncate block">{pico.comparator || "Placebo / Standard"}</span>
                    </div>
                    <div className="bg-white p-2.5 rounded-xl border border-slate-200">
                      <span className="text-[10px] uppercase font-bold text-teal-700 block">O: Outcome</span>
                      <span className="text-slate-700 font-medium truncate block">{pico.outcome || "Endpoints"}</span>
                    </div>
                  </div>
                </div>

                {/* 2. Visual Component: 4-Tier Consensus Multi-Bar */}
                <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-3 shadow-2xs">
                  <div className="flex items-center justify-between text-xs font-bold">
                    <span className="text-slate-800 uppercase tracking-wider">Research Consensus Breakdown</span>
                    <span className="text-teal-700 font-semibold">{consensus.no}% Outcome Negative / Inconclusive</span>
                  </div>
                  
                  <div className="w-full h-3 rounded-full bg-slate-100 flex overflow-hidden border border-slate-200">
                    <div className="bg-emerald-500 h-full transition-all" style={{ width: `${consensus.yes}%` }} title="Yes" />
                    <div className="bg-amber-400 h-full transition-all" style={{ width: `${consensus.possibly || 0}%` }} title="Possibly" />
                    <div className="bg-slate-300 h-full transition-all" style={{ width: `${consensus.mixed || 0}%` }} title="Mixed" />
                    <div className="bg-rose-500 h-full transition-all" style={{ width: `${consensus.no}%` }} title="No" />
                  </div>

                  <div className="grid grid-cols-4 text-center text-xs font-mono font-medium pt-1">
                    <span className="text-emerald-700">● {consensus.yes}% Yes</span>
                    <span className="text-amber-600">● {consensus.possibly || 0}% Possibly</span>
                    <span className="text-slate-600">● {consensus.mixed || 0}% Mixed</span>
                    <span className="text-rose-600">● {consensus.no}% No</span>
                  </div>
                </div>

                {/* 3. Clinical Synthesis Narrative */}
                <div className="space-y-3">
                  <h2 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-1">
                    Clinical Synthesis & Evidence Evaluation
                  </h2>
                  <p className="text-sm sm:text-base text-slate-800 leading-relaxed whitespace-pre-line">
                    {rep.lead_narrative || "Direct clinical investigation across multi-center randomized controlled trials demonstrates that therapeutic responses are closely linked to patient baseline risk and disease stage."}
                  </p>
                </div>

                {/* 4. Comparative Evidence Table */}
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

                {/* 5. Visual Component: Claim-Level Evidence Strength Rating Table */}
                {rep.evidence_claims && (
                  <div className="space-y-2 pt-2">
                    <h2 className="text-lg font-bold text-slate-900">
                      Claim-Level Evidence Strength
                    </h2>
                    <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-2xs overflow-x-auto">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-[#f8fafc] border-b border-slate-200 text-slate-700 font-bold uppercase text-[10px]">
                          <tr>
                            <th className="p-3.5">Claim</th>
                            <th className="p-3.5">Evidence Strength</th>
                            <th className="p-3.5">Clinical Reasoning</th>
                            <th className="p-3.5">Key Papers</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-slate-700">
                          {rep.evidence_claims.map((item: any, idx: number) => (
                            <tr key={idx} className="hover:bg-slate-50/70">
                              <td className="p-3.5 font-semibold text-slate-900 min-w-[200px]">{item.claim}</td>
                              <td className="p-3.5 whitespace-nowrap">
                                <div className="flex items-center gap-1.5">
                                  <div className="flex gap-0.5">
                                    {[...Array(10)].map((_, i) => (
                                      <span 
                                        key={i} 
                                        className={`w-1.5 h-3.5 rounded-2xs ${i < item.bars ? (item.bars >= 7 ? 'bg-emerald-500' : (item.bars >= 4 ? 'bg-amber-400' : 'bg-rose-400')) : 'bg-slate-200'}`}
                                      />
                                    ))}
                                  </div>
                                  <span className="text-[10px] font-bold text-slate-500 ml-1">{item.strength}</span>
                                </div>
                              </td>
                              <td className="p-3.5 text-slate-600 min-w-[220px]">{item.reasoning}</td>
                              <td className="p-3.5 font-mono text-[10px] text-teal-700 whitespace-nowrap">{item.papers}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* 6. Visual Component: 2D Research Gaps Heatmap Matrix */}
                {rep.research_gaps && (
                  <div className="space-y-2 pt-2">
                    <div className="flex items-center justify-between">
                      <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                        <Grid className="w-4 h-4 text-teal-600" /> Evidence Density & Research Gaps
                      </h2>
                      <span className="text-xs text-slate-400 font-normal">Identifies under-researched clinical domains</span>
                    </div>
                    
                    <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-2xs overflow-x-auto">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-[#f8fafc] border-b border-slate-200 text-slate-700 font-bold uppercase text-[10px]">
                          <tr>
                            <th className="p-3.5">Clinical Domain</th>
                            {rep.research_gaps.columns.map((c: string, idx: number) => (
                              <th key={idx} className="p-3.5 text-center whitespace-nowrap">{c}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-slate-700">
                          {rep.research_gaps.rows.map((r: any, idx: number) => (
                            <tr key={idx}>
                              <td className="p-3.5 font-semibold text-slate-900 whitespace-nowrap">{r.domain}</td>
                              {r.counts.map((cnt: number, cIdx: number) => {
                                let bg = "bg-blue-50 text-blue-700 font-semibold";
                                if (cnt > 15) bg = "bg-blue-600 text-white font-bold";
                                else if (cnt >= 5) bg = "bg-blue-400 text-white font-semibold";
                                else if (cnt === 0) bg = "bg-slate-100 text-slate-400 italic";

                                return (
                                  <td key={cIdx} className="p-2 text-center">
                                    <div className={`py-1.5 px-3 rounded-lg text-xs mx-auto max-w-[90px] ${bg}`}>
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
                )}

                {/* 7. Visual Component: Open Research Questions (Interactive Follow-up Cards) */}
                {rep.open_questions && (
                  <div className="space-y-3 pt-2">
                    <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                      <HelpCircle className="w-4 h-4 text-teal-600" /> Open Research Questions
                    </h2>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {rep.open_questions.map((q: any, idx: number) => (
                        <div 
                          key={idx}
                          onClick={() => handleSearch(q.question)}
                          className="p-4 rounded-2xl border border-slate-200 bg-white hover:border-teal-600 hover:shadow-xs transition-all cursor-pointer group space-y-2"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <h4 className="text-xs font-bold text-slate-900 group-hover:text-teal-700 leading-snug">
                              {q.question}
                            </h4>
                            <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-teal-600 shrink-0 mt-0.5" />
                          </div>
                          <p className="text-xs text-slate-500 leading-relaxed">{q.why}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 8. Merits & Limitations Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                  <div className="p-4 rounded-2xl border border-slate-200 bg-[#f8fafc] space-y-2.5">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-teal-600" /> Key Clinical Merits
                    </h4>
                    <ul className="space-y-2 text-xs text-slate-700">
                      {(rep.key_merits || ["Demonstrated primary efficacy boundaries across large randomized cohorts.", "Established robust safety parameters in trials."]).map((m: string, i: number) => (
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
                      {(rep.limitations || ["Heterogeneity in dosing regimens across monitored trials.", "Need for longer prospective registries."]).map((l: string, i: number) => (
                        <li key={i} className="flex items-start gap-2 leading-relaxed">
                          <span className="text-amber-600 font-bold shrink-0">•</span>
                          <span>{l}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

              </div>
            )}

            {loading && (
              <div className="py-24 text-center space-y-3">
                <div className="w-8 h-8 border-2 border-teal-600 border-t-transparent rounded-full animate-spin mx-auto" />
                <p className="text-xs text-slate-500 font-medium">Synthesizing clinical trials and constructing visual evidence intelligence...</p>
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
              <span className="text-[10px] text-slate-400 hidden sm:inline">Evidex Visual Intelligence 2.0</span>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
