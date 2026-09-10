"use client";

import { useState, useRef } from "react";
import { 
  Search, ArrowUp, ExternalLink, CheckCircle2, 
  Plus, Home as HomeIcon, Filter, Database, Scale, Table as TableIcon, FileText, 
  Sparkles, Check, ChevronRight, Menu, X, BookOpen, Download, Copy, CheckCheck,
  ShieldCheck, FileSearch, MessageSquare, History, Bookmark, Share2, CornerDownRight,
  SlidersHorizontal, ChevronDown, ListChecks, ArrowRight, Lightbulb, Quote, Layers
} from "lucide-react";

export default function Home() {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState<any | null>(null);
  const [selectedStudy, setSelectedStudy] = useState<any | null>(null);
  const [showReferencesPanel, setShowReferencesPanel] = useState(true);
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

  return (
    <div className="flex h-screen w-screen bg-white text-slate-900 font-sans overflow-hidden antialiased">
      
      {/* 1. ULTRA-MINIMAL CONSENSUS LEFT ICON RAIL */}
      <aside className="w-14 border-r border-slate-200 bg-[#fbfbfb] flex flex-col items-center py-3 justify-between shrink-0 z-30">
        <div className="space-y-4 flex flex-col items-center">
          <div className="w-8 h-8 rounded-lg bg-teal-600 text-white flex items-center justify-center font-black text-sm">
            C
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

        <div className="w-7 h-7 rounded-full bg-purple-700 text-white flex items-center justify-center text-xs font-bold">
          M
        </div>
      </aside>

      {/* 2. DUAL-PANE MAIN WORKSPACE */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        
        {/* Top Header */}
        <header className="h-11 border-b border-slate-200 px-4 flex items-center justify-between shrink-0 bg-white z-20 text-xs">
          <div className="flex items-center gap-3">
            <span className="font-bold text-slate-800 truncate max-w-xs sm:max-w-md">
              {report ? report.query : "Clinical report"}
            </span>
            <span className="text-slate-400">▾</span>
          </div>

          <div className="flex items-center gap-2">
            <button 
              onClick={() => setShowReferencesPanel(!showReferencesPanel)}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-md border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 font-semibold"
            >
              <BookOpen className="w-3.5 h-3.5 text-teal-600" />
              <span>References</span>
            </button>
            <button className="flex items-center gap-1 px-2 py-1 rounded-md border border-slate-200 text-slate-600 hover:bg-slate-50">
              <Share2 className="w-3.5 h-3.5" />
              <span>Share</span>
            </button>
          </div>
        </header>

        {/* Content Split: Left (Document) + Right (References Drawer) */}
        <div className="flex-1 flex overflow-hidden">
          
          {/* LEFT: CONSENSUS CLINICAL REPORT DOCUMENT */}
          <div className="flex-1 overflow-y-auto px-6 sm:px-12 py-8 max-w-3xl mx-auto w-full space-y-7 pb-28 text-left">
            
            {/* Initial Prompt Screen */}
            {!report && !loading && (
              <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-6 max-w-lg mx-auto pt-10">
                <div className="flex items-center gap-2 font-bold text-xl text-slate-900">
                  <span className="w-6 h-6 rounded-full bg-teal-600 text-white flex items-center justify-center text-xs">C</span>
                  Consensus
                </div>
                <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">
                  Research starts here
                </h1>
                
                {/* Search box center */}
                <div className="w-full bg-white border border-slate-300 focus-within:border-teal-600 rounded-2xl p-2.5 shadow-sm">
                  <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                    placeholder="Ask the research..."
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
                  {["Clinical report", "How research has evolved", "Find the Consensus"].map((item, i) => (
                    <button
                      key={i}
                      onClick={() => handleSearch(item)}
                      className="px-3 py-1.5 rounded-full border border-slate-200 bg-white hover:bg-slate-50 text-xs text-slate-700 shadow-2xs"
                    >
                      {item}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Structured Consensus Report Output */}
            {report && (
              <div className="space-y-6">
                
                {/* User Query Right Tag */}
                <div className="flex justify-end">
                  <span className="bg-blue-50 text-blue-800 text-xs font-semibold px-3 py-1.5 rounded-full">
                    {report.query}
                  </span>
                </div>

                {/* Pro Status Meta Strip */}
                <div className="text-xs text-slate-500 flex items-center gap-2">
                  <span className="font-bold text-teal-700">Pro</span>
                  <span>•</span>
                  <span>2 steps</span>
                  <span>›</span>
                  <span className="font-semibold text-slate-700">Read Abstracts and PDFs 20 ›</span>
                </div>

                {/* Title */}
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 leading-snug">
                  {rep.title || "Clinical Case Reports in Medical Literature"}
                </h1>

                {/* Lead Narrative with Inline Badges */}
                <div className="text-sm sm:text-base text-slate-800 leading-relaxed space-y-2">
                  <p>
                    {rep.lead_paragraph || "A clinical case report is a detailed narrative documenting a medical problem experienced by one or more patients, written for medical, scientific, or educational purposes."}
                    <span className="inline-flex items-center gap-1 mx-1.5 align-baseline">
                      <span className="bg-slate-200 text-slate-800 text-[10px] font-bold px-1.5 py-0.5 rounded font-mono">GAGNIER 2013</span>
                      <span className="bg-slate-200 text-slate-800 text-[10px] font-bold px-1.5 py-0.5 rounded font-mono">ABDELGHANI 2024</span>
                    </span>
                    The genre dates back centuries, with one of the earliest documented collections being 700 case texts by the 16th-century Portuguese physician Amato Lusitano.
                  </p>
                </div>

                {/* Definition and Structure */}
                <div className="space-y-3 pt-2">
                  <h2 className="text-lg font-bold text-slate-900">Definition and Structure</h2>
                  <p className="text-sm text-slate-700 leading-relaxed">
                    {rep.definition_and_structure || "Case reports are most often naturalistic and descriptive. They are formal summaries of a unique patient and illness, including presenting signs, symptoms, diagnostic studies, treatment course, and outcome."}
                    <span className="bg-slate-200 text-slate-800 text-[10px] font-bold px-1.5 py-0.5 rounded font-mono ml-1.5">NISSEN 2014</span>
                  </p>
                </div>

                {/* Structural Breakdown Table */}
                {rep.table && (
                  <div className="pt-2 space-y-2">
                    <div className="border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold uppercase text-[10px]">
                          <tr>
                            {rep.table.columns.map((c: string, idx: number) => (
                              <th key={idx} className="p-3">{c}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-slate-700">
                          {rep.table.rows.map((row: string[], idx: number) => (
                            <tr key={idx} className="hover:bg-slate-50/50">
                              <td className="p-3 font-semibold text-slate-900">{row[0]}</td>
                              <td className="p-3 text-slate-600 leading-relaxed">{row[1]}</td>
                              <td className="p-3">
                                <span className="bg-slate-100 border border-slate-200 text-slate-800 text-[10px] font-mono font-bold px-1.5 py-0.5 rounded">
                                  {row[2]}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    <p className="text-[11px] text-slate-400 font-serif italic">
                      FIGURE 1: Standard structural components of a clinical case report and their descriptions.
                    </p>
                  </div>
                )}

                {/* CARE Guidelines Paragraph */}
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 leading-relaxed space-y-2">
                  <p>
                    The <strong>CARE (CAse REport) guidelines</strong>, developed through a 27-participant consensus process, provide a 13-item checklist covering title, keywords, abstract, introduction, patient information, clinical findings, timeline, diagnostic assessment, therapeutic interventions, follow-up and outcomes, discussion, patient perspective, and informed consent.
                    <span className="bg-slate-200 text-slate-800 text-[10px] font-bold px-1.5 py-0.5 rounded font-mono ml-1">GAGNIER 2013</span>
                  </p>
                </div>

                {/* Merits and Limitations */}
                <div className="space-y-3 pt-2">
                  <h2 className="text-lg font-bold text-slate-900">Merits and Limitations</h2>
                  <p className="text-sm text-slate-700 leading-relaxed">
                    Case reports have historically driven major medical discoveries, including identification of adult T-cell leukemia and AIDS, and recognition of the relationship between thalidomide and congenital abnormalities.
                  </p>

                  <div className="space-y-1.5 pt-1">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-800">Key merits of the case report genre:</span>
                    <ul className="space-y-2 text-xs text-slate-700 pl-2">
                      {rep.merits_and_limitations?.key_merits?.map((m: string, i: number) => (
                        <li key={i} className="flex items-start gap-2">
                          <span className="text-slate-400 font-bold">•</span>
                          <span>{m}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="space-y-1.5 pt-3">
                    <p className="text-xs text-slate-700 leading-relaxed">
                      Despite these strengths, case reports occupy the <strong>lowest level in the evidence hierarchy</strong>. They cannot establish cause-effect relationships, lack generalizability, and carry risks of publication bias and over-interpretation.
                      <span className="bg-slate-200 text-slate-800 text-[10px] font-bold px-1.5 py-0.5 rounded font-mono ml-1.5">NISSEN 2014</span>
                    </p>
                  </div>
                </div>

              </div>
            )}

            {loading && (
              <div className="py-24 text-center space-y-3">
                <div className="w-7 h-7 border-2 border-teal-600 border-t-transparent rounded-full animate-spin mx-auto" />
                <p className="text-xs text-slate-500 font-medium">Extracting medical literature and compiling clinical consensus report...</p>
              </div>
            )}

          </div>

          {/* RIGHT: INTERACTIVE REFERENCES PANEL (Consensus Dual-Pane) */}
          {report && showReferencesPanel && (
            <div className="w-80 sm:w-96 border-l border-slate-200 bg-[#fdfdfd] flex flex-col h-full overflow-hidden shrink-0 text-left">
              
              {/* Reference Header */}
              <div className="p-3.5 border-b border-slate-200 flex items-center justify-between text-xs bg-white">
                <div className="font-bold text-slate-800">
                  References <span className="text-slate-400 font-normal">({report.total_studies_scanned})</span>
                </div>
                <button onClick={() => setShowReferencesPanel(false)} className="text-slate-400 hover:text-slate-700">
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Reference List */}
              <div className="flex-1 overflow-y-auto p-3 space-y-3">
                {report.studies?.map((item: any) => (
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

                    {/* Key Takeaway Quote Bubble */}
                    <div className="p-2 rounded-lg bg-slate-50 border border-slate-100 text-[11px] text-slate-600 leading-relaxed">
                      <span className="font-bold text-[10px] uppercase text-slate-400 block mb-0.5">Key Takeaway</span>
                      {item.key_takeaway}
                    </div>

                    <div className="flex items-center justify-between pt-1 text-[10px]">
                      <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 font-bold uppercase">
                        {item.badge}
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

        {/* 3. BOTTOM PERSISTENT DOCKED CHAT BAR */}
        <div className="p-3 bg-white border-t border-slate-200 shrink-0 z-20">
          <div className="max-w-3xl mx-auto w-full space-y-1.5">
            <div className="bg-slate-50 border border-slate-300 focus-within:border-teal-600 focus-within:ring-2 focus-within:ring-teal-100 rounded-2xl p-2 transition-all flex items-center gap-2">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                placeholder="Does adherence to CARE guidelines improve publication acceptance rates?..."
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
                <span className="bg-slate-100 px-2 py-0.5 rounded font-medium text-slate-700 flex items-center gap-1">
                  <Filter className="w-3 h-3" /> Filter
                </span>
              </div>
              <span className="text-[10px] text-slate-400 hidden sm:inline">Evidex Clinical Engine</span>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
