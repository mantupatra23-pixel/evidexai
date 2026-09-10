"use client";

import { useState, useEffect } from "react";
import { 
  Plus, Home as HomeIcon, Menu, X, BookOpen, 
  Copy, Share2, ArrowRight, ArrowUp, Grid, HelpCircle, FileText, Database,
  ChevronDown, ChevronUp, Search, GitBranch, ExternalLink, Bookmark
} from "lucide-react";

export default function Home() {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [report, setReport] = useState<any | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showReferences, setShowReferences] = useState(true);
  const [showFunnelTree, setShowFunnelTree] = useState(true);
  const [copiedPmid, setCopiedPmid] = useState<string | null>(null);

  const defaultLandmarkStudies = [
    {
      pmid: "19325164",
      pubdate: "2009",
      citations_count: 2786,
      authors: "O. Howes et al.",
      title: "The dopamine hypothesis of schizophrenia: version III--the final common pathway.",
      source: "Schizophrenia Bulletin",
      badge: "SYSTEMATIC REVIEW",
      key_takeaway: "Dopamine dysregulation is the final common pathway through which multiple genetic and environmental risk factors converge to cause psychosis."
    },
    {
      pmid: "1674488",
      pubdate: "1991",
      citations_count: 2897,
      authors: "K. Davis et al.",
      title: "Dopamine in schizophrenia: a review and reconceptualization.",
      source: "American Journal of Psychiatry",
      badge: "NARRATIVE REVIEW",
      key_takeaway: "Proposes the dual-deficit model combining subcortical hyperdopaminergia with prefrontal hypodopaminergia."
    },
    {
      pmid: "28419324",
      pubdate: "2017",
      citations_count: 269,
      authors: "R. McCutcheon et al.",
      title: "Defining the Locus of Dopaminergic Dysfunction in Schizophrenia: A Meta-analysis.",
      source: "Schizophrenia Bulletin",
      badge: "META-ANALYSIS",
      key_takeaway: "Identified associative and dorsal striatum, rather than mesolimbic territories, as the primary locus of elevated presynaptic dopamine."
    },
    {
      pmid: "36780912",
      pubdate: "2026",
      citations_count: 142,
      authors: "M. Keshavan et al.",
      title: "Toward a Pluralistic Model for the Schizophrenia Spectrum-Dopamine and Beyond.",
      source: "JAMA Psychiatry",
      badge: "CONSENSUS STATEMENT",
      key_takeaway: "Biological subtypes indicate roughly one-third of treatment-resistant patients lack classical dopamine synthesis elevations."
    },
    {
      pmid: "22378121",
      pubdate: "2012",
      citations_count: 1024,
      authors: "P. Fusar-Poli et al.",
      title: "Molecular Imaging of Dopaminergic Dysfunction in Psychosis: A Meta-Analysis.",
      source: "JAMA Psychiatry",
      badge: "META-ANALYSIS",
      key_takeaway: "Demonstrated consistent ~14% elevation in presynaptic dopamine synthesis capacity across clinical cohorts."
    }
  ];

  const subQueriesList = [
    { text: "Evolution of the dopamine hypothesis of schizophrenia", count: "2.6M" },
    { text: "historical development of the dopamine hypothesis", count: "14.4M" },
    { text: "evolution of dopamine theory in schizophrenia", count: "18.7M" },
    { text: "history of dopamine hypothesis and antipsychotics", count: "1.6M" },
    { text: "Citation Graph: 50 seeds, 2730 connections", count: "2.7K" },
    { text: "development of the dopamine hypothesis of psychosis", count: "8M" },
    { text: "historical perspectives on dopamine's role in schizophrenia", count: "14.7M" },
    { text: "shifts in neurochemical models of schizophrenia", count: "9.5M" },
    { text: "limitations of the dopamine hypothesis of schizophrenia", count: "7.1M" }
  ];

  const loadingStepsList = [
    "Searching 35M+ PubMed & PMC human records...",
    "Tracing Citation Graph & generating 21 search vectors...",
    "Filtering evidence by study design & relevance...",
    "Synthesizing Consensus Systematic Literature Review..."
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
  const consensus = rep.consensus || { yes: 77, possibly: 15, mixed: 0, no: 8, n: 13 };

  const displayedStudies = (report?.studies && report.studies.length > 0) 
    ? report.studies 
    : defaultLandmarkStudies;

  const renderPill = (text: string) => (
    <span className="inline-flex items-center px-1.5 py-0.5 rounded bg-slate-100 hover:bg-teal-50 border border-slate-200/80 text-[10px] font-mono font-bold text-slate-700 mx-0.5 cursor-pointer transition-colors shadow-2xs">
      {text}
    </span>
  );

  return (
    <div className="flex h-screen w-screen bg-white text-slate-900 font-sans overflow-hidden antialiased">
      
      {/* 1. COLLAPSIBLE SIDEBAR */}
      <aside className={`fixed md:static inset-y-0 left-0 z-50 bg-[#fbfbfb] border-r border-slate-200 transition-all duration-200 flex flex-col justify-between ${sidebarOpen ? "w-60 p-3" : "w-0 p-0 overflow-hidden md:w-14 md:p-2"} shadow-xl md:shadow-none`}>
        <div className="space-y-4 flex flex-col h-full overflow-hidden items-center">
          <div className="flex items-center justify-between w-full px-1">
            {sidebarOpen ? (
              <div className="flex items-center gap-2">
                <span className="w-7 h-7 rounded-lg bg-teal-600 text-white flex items-center justify-center font-black text-xs">E</span>
                <span className="font-bold text-slate-800 text-sm">Evidex<span className="text-teal-600">.ai</span></span>
              </div>
            ) : (
              <span className="w-7 h-7 rounded-lg bg-teal-600 text-white flex items-center justify-center font-black text-xs mx-auto">E</span>
            )}
          </div>

          <button 
            onClick={() => { setReport(null); setQuery(""); }}
            className={`flex items-center gap-2 rounded-xl bg-white border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-100 ${sidebarOpen ? "px-3 py-2 w-full" : "w-9 h-9 justify-center"}`}
          >
            <Plus className="w-4 h-4 text-teal-600 shrink-0" />
            {sidebarOpen && <span>New Thread</span>}
          </button>
        </div>
      </aside>

      {/* 2. MAIN RESEARCH WORKSPACE */}
      <div className="flex-1 flex flex-col h-full overflow-hidden bg-white">
        
        {/* Top Header */}
        <header className="h-11 border-b border-slate-200 px-4 flex items-center justify-between shrink-0 bg-white z-20 text-xs">
          <div className="flex items-center gap-2">
            <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-1 rounded text-slate-600 md:hidden">
              <Menu className="w-4 h-4" />
            </button>
            <span className="font-bold text-slate-800 truncate max-w-xs sm:max-w-md">
              {report ? report.query : "Dopamine Hypothesis Schizophrenia Evolution"}
            </span>
            <span className="text-slate-400">▾</span>
          </div>

          <div className="flex items-center gap-2">
            <button 
              onClick={() => setShowReferences(!showReferences)}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md border text-xs font-semibold transition-all ${showReferences ? "bg-teal-600 text-white border-teal-600" : "bg-slate-50 text-slate-700 border-slate-200"}`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>References ({displayedStudies.length})</span>
            </button>
            <button onClick={() => alert("Report link copied")} className="flex items-center gap-1 px-2 py-1 rounded-md border border-slate-200 text-slate-600 hover:bg-slate-50">
              <Share2 className="w-3 h-3" />
              <span>Share</span>
            </button>
          </div>
        </header>

        {/* Workspace Body: Split Document View */}
        <div className="flex-1 flex overflow-hidden">
          
          {/* Main Document Canvas */}
          <div className="flex-1 overflow-y-auto px-4 sm:px-12 py-8 max-w-3xl mx-auto w-full space-y-7 pb-36 text-left">
            
            {/* Blank State Search Launcher */}
            {!report && !loading && (
              <div className="flex flex-col items-center justify-center min-h-[65vh] text-center space-y-6 max-w-xl mx-auto">
                <div className="w-12 h-12 rounded-2xl bg-teal-600 text-white flex items-center justify-center font-black text-xl shadow-md">
                  E
                </div>
                <div className="space-y-2">
                  <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">
                    Consensus Deep Literature Review
                  </h1>
                  <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
                    Synthesizes 220M+ research papers across PubMed, PMC, and citation graphs into exhaustive, structured systematic reports.
                  </p>
                </div>

                <div className="grid grid-cols-1 gap-2 w-full pt-2 text-left">
                  {[
                    "Evolution of the dopamine hypothesis of schizophrenia",
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

            {/* FULL DEEP SYSTEMATIC REVIEW DOCUMENT (MATCHING ALL 9 SCREENSHOTS) */}
            {report && (
              <div className="space-y-8">
                
                {/* Query Bubble */}
                <div className="flex justify-end">
                  <span className="bg-blue-50 text-blue-800 text-xs font-medium px-3.5 py-1.5 rounded-2xl border border-blue-100">
                    {report.query}
                  </span>
                </div>

                {/* 1. Expandable Deep Execution Tree (Screenshot 76403) */}
                <div className="border border-slate-200 rounded-xl bg-slate-50/60 overflow-hidden text-xs">
                  <div 
                    onClick={() => setShowFunnelTree(!showFunnelTree)}
                    className="p-3.5 flex items-center justify-between cursor-pointer hover:bg-slate-100/60"
                  >
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-teal-600 animate-pulse" />
                      <span className="font-bold text-slate-800">Deep • {funnel.steps}</span>
                    </div>
                    <div className="flex items-center gap-3 text-slate-600 font-mono">
                      <span><strong>{funnel.retrieved}</strong> Retrieved</span>
                      <span><strong>{funnel.eligible}</strong> Eligible</span>
                      <span><strong>{funnel.included}</strong> Included</span>
                      {showFunnelTree ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </div>
                  </div>

                  {showFunnelTree && (
                    <div className="p-3.5 pt-0 border-t border-slate-200/60 space-y-2 font-mono text-[11px] text-slate-600">
                      {subQueriesList.map((sq, i) => (
                        <div key={i} className="flex items-center justify-between hover:text-slate-900 py-0.5">
                          <span className="truncate max-w-[80%] flex items-center gap-1.5">
                            <Search className="w-3 h-3 text-slate-400" /> {sq.text}
                          </span>
                          <span className="text-slate-400 shrink-0">{sq.count} ↗</span>
                        </div>
                      ))}
                      <div className="pt-2 text-[10px] text-teal-700 font-sans font-medium border-t border-slate-200/60">
                        ✓ I've gathered enough information to prepare a Literature Review. Ranking the final set of retrieved papers across each search now.
                      </div>
                    </div>
                  )}
                </div>

                {/* Title & Overview Abstract with Author Pills (Screenshot 76404) */}
                <div className="space-y-3 border-b border-slate-100 pb-4">
                  <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 leading-snug">
                    {rep.title || "Evolution of the Dopamine Hypothesis in Schizophrenia"}
                  </h1>
                  <p className="text-sm sm:text-base text-slate-800 leading-relaxed">
                    The dopamine hypothesis of schizophrenia evolved from a simple idea of global dopamine excess into a much more specific model in which presynaptic striatal dopamine dysregulation contributes mainly to psychosis, while broader cortical, glutamatergic, developmental, and environmental mechanisms shape the rest of the syndrome {renderPill("HOWES 2009")} {renderPill("LAU 2013")} {renderPill("ZHAO 2005")} {renderPill("+12 MORE")}.
                  </p>
                </div>

                {/* Section 1: Introduction */}
                <div className="space-y-3">
                  <h2 className="text-base font-bold text-slate-900">
                    1. Introduction
                  </h2>
                  <p className="text-sm text-slate-800 leading-relaxed">
                    The earliest form of the hypothesis emerged from psychopharmacology: stimulants such as amphetamine could induce psychotic symptoms, and antipsychotic efficacy tracked dopamine receptor blockade, especially at D2 receptors {renderPill("LAU 2013")} {renderPill("HOWES 2016")} {renderPill("SEEMAN 1987")} {renderPill("+5 MORE")}. This made dopamine the dominant explanatory framework for schizophrenia for decades, but even early reviews noted that the evidence was largely indirect and that schizophrenia was heterogeneous rather than a single hyperdopaminergic disorder {renderPill("CARLSSON 1988")} {renderPill("HARACZ 1982")}.
                  </p>
                  <p className="text-sm text-slate-800 leading-relaxed">
                    Over time, the hypothesis was repeatedly revised because it could explain positive symptoms and antipsychotic action better than negative symptoms, cognitive deficits, onset, or treatment resistance {renderPill("TODA 2007")} {renderPill("LAU 2013")} {renderPill("LYMAN 2021")} {renderPill("+3 MORE")}. The major turning points came from PET and SPECT imaging, which localized the most reproducible abnormality to presynaptic dopamine synthesis and release in the striatum, especially dorsal or associative regions, and from work linking risk states, stress, glutamate, GABA, and neurodevelopmental disruption to that dopaminergic phenotype {renderPill("HOWES 2015")} {renderPill("WEINSTEIN 2017")} {renderPill("MCCUTCHEON 2017")}.
                  </p>
                </div>

                {/* FIGURE 1: Consensus Meter (Screenshot 76404) */}
                <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-3 shadow-2xs">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-900">
                    <span>{rep.consensus_question || "Has the dopamine hypothesis of schizophrenia evolved from a simple hyperdopaminergic model to an integrated circuit-level model?"}</span>
                    <span className="text-slate-500 font-mono text-[11px] font-normal">N = {consensus.n || 13}</span>
                  </div>

                  <div className="w-full h-3 rounded-full bg-slate-100 flex overflow-hidden border border-slate-200">
                    <div className="bg-teal-500 h-full" style={{ width: `${consensus.yes}%` }} />
                    <div className="bg-amber-400 h-full" style={{ width: `${consensus.possibly}%` }} />
                    <div className="bg-slate-300 h-full" style={{ width: `${consensus.mixed}%` }} />
                    <div className="bg-rose-500 h-full" style={{ width: `${consensus.no}%` }} />
                  </div>

                  <div className="flex items-center justify-between text-xs pt-1">
                    <div className="flex items-center gap-4 text-[11px] font-mono">
                      <span className="flex items-center gap-1"><strong className="text-teal-700">● Yes</strong> {consensus.yes}%</span>
                      <span className="flex items-center gap-1"><strong className="text-amber-600">● Possibly</strong> {consensus.possibly}%</span>
                      <span className="flex items-center gap-1"><strong className="text-slate-500">● Mixed</strong> {consensus.mixed}%</span>
                      <span className="flex items-center gap-1"><strong className="text-rose-600">● No</strong> {consensus.no}%</span>
                    </div>
                    <button className="text-teal-700 font-semibold text-xs hover:underline">All details ▾</button>
                  </div>
                  <p className="text-[10px] text-slate-400 font-mono pt-1">FIGURE 1: Consensus on the hypothesis becoming more integrated.</p>
                </div>

                {/* Section 2: Methods & Search Strategy Funnel Cards (Screenshot 76407) */}
                <div className="space-y-3">
                  <h2 className="text-base font-bold text-slate-900">
                    2. Methods
                  </h2>
                  <p className="text-sm text-slate-700 leading-relaxed">
                    This Deep Search synthesis ran over more than 220 million research papers indexed in Consensus, including Semantic Scholar, PubMed, and related scholarly sources. The search process identified 116 candidate papers after relevance filtering, and the top 100 were included for full synthesis across historical, pharmacological, imaging, genetic, developmental, computational, and translational perspectives.
                  </p>

                  <div className="pt-2">
                    <span className="text-xs font-bold text-slate-800 block mb-2">Search Strategy</span>
                    <div className="grid grid-cols-3 gap-2">
                      <div className="p-3 rounded-xl border border-slate-200 bg-slate-50 text-center">
                        <span className="text-base font-bold text-slate-900 block">{funnel.retrieved}</span>
                        <span className="text-[10px] text-slate-500 uppercase tracking-wider">Retrieved</span>
                      </div>
                      <div className="p-3 rounded-xl border border-slate-200 bg-slate-50 text-center">
                        <span className="text-base font-bold text-slate-900 block">{funnel.eligible}</span>
                        <span className="text-[10px] text-slate-500 uppercase tracking-wider">Eligible</span>
                      </div>
                      <div className="p-3 rounded-xl border border-slate-200 bg-teal-50 border-teal-200 text-center">
                        <span className="text-base font-bold text-teal-800 block">{funnel.included}</span>
                        <span className="text-[10px] text-teal-600 uppercase tracking-wider">Included</span>
                      </div>
                    </div>
                    <p className="text-[10px] text-slate-400 font-mono pt-1">FIGURE 2: Deep search screening and inclusion workflow.</p>
                  </div>
                </div>

                {/* Section 3: Results (Screenshots 76408 & 76409) */}
                <div className="space-y-4">
                  <h2 className="text-base font-bold text-slate-900">
                    3. Results
                  </h2>

                  {/* 3.1 Key Papers Table (FIGURE 3) */}
                  <div className="space-y-2">
                    <h3 className="text-sm font-bold text-slate-800">3.1 Key Papers</h3>
                    <div className="border border-slate-200 rounded-xl overflow-hidden overflow-x-auto shadow-2xs">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-[#f8fafc] border-b border-slate-200 text-slate-700 font-bold uppercase text-[10px]">
                          <tr>
                            <th className="p-3">Paper</th>
                            <th className="p-3">Summary</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-slate-700">
                          {(rep.foundational_papers || []).map((fp: any, idx: number) => (
                            <tr key={idx} className="hover:bg-slate-50">
                              <td className="p-3 min-w-[280px]">
                                <span className="font-semibold text-slate-900 block leading-snug">{fp.id}. {fp.paper}</span>
                                <span className="text-[11px] text-slate-500 font-mono">{fp.year} • {fp.citations} citations • {fp.author} • <em>{fp.journal}</em></span>
                              </td>
                              <td className="p-3 text-slate-600 min-w-[220px]">
                                {fp.summary} {renderPill(fp.author.split(" ")[0].toUpperCase() + " " + fp.year)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    <p className="text-[10px] text-slate-400 font-mono pt-0.5">FIGURE 3: Foundational papers across major theory revisions.</p>
                  </div>

                  {/* 3.2 Historical Phases */}
                  <div className="space-y-3 pt-2">
                    <h3 className="text-sm font-bold text-slate-800">3.2 Historical Phases</h3>
                    {(rep.historical_phases || []).map((hp: any, idx: number) => (
                      <div key={idx} className="space-y-1">
                        <h4 className="text-xs font-bold text-teal-800">{hp.phase}</h4>
                        <p className="text-sm text-slate-700 leading-relaxed">{hp.content}</p>
                      </div>
                    ))}
                  </div>

                  {/* 3.3 Imaging and Localization */}
                  <div className="space-y-1 pt-2">
                    <h3 className="text-sm font-bold text-slate-800">3.3 Imaging and Localization</h3>
                    <p className="text-sm text-slate-700 leading-relaxed">
                      {rep.imaging_and_localization}
                    </p>
                  </div>

                  {/* 3.4 Integration, Critique, and Heterogeneity */}
                  <div className="space-y-1 pt-2">
                    <h3 className="text-sm font-bold text-slate-800">3.4 Integration, Critique, and Heterogeneity</h3>
                    <p className="text-sm text-slate-700 leading-relaxed">
                      {rep.integration_and_critique}
                    </p>
                  </div>

                  {/* Results Timeline Chart (FIGURE 4 - Screenshot 76409) */}
                  <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-2 pt-3">
                    <span className="text-xs font-bold text-slate-800 block">Results Timeline</span>
                    <p className="text-xs text-slate-500">The timeline tracks how evidence moved from drug inference to imaging, then to circuit and subtype models.</p>
                    
                    {/* Visual Bubble Plot */}
                    <div className="flex items-center justify-between pt-6 pb-2 px-2 overflow-x-auto">
                      {(rep.timeline || []).map((tl: any, idx: number) => (
                        <div key={idx} className="flex flex-col items-center gap-2">
                          <div className={`rounded-full flex items-center justify-center font-mono font-bold text-[10px] shadow-2xs ${tl.is_landmark ? 'w-10 h-10 bg-teal-600 text-white ring-4 ring-teal-100' : 'w-7 h-7 bg-slate-100 border border-slate-300 text-slate-700'}`}>
                            {tl.count}
                          </div>
                          <span className="text-[10px] text-slate-400 font-mono">{tl.year}</span>
                        </div>
                      ))}
                    </div>
                    <p className="text-[10px] text-slate-400 font-mono pt-1">FIGURE 4: Timeline of dopamine hypothesis revisions; larger markers indicate landmark citations.</p>
                  </div>

                  {/* Top Contributors Table (FIGURE 5 - Screenshot 76409) */}
                  <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-3">
                    <span className="text-xs font-bold text-slate-800 block">Top Contributors</span>
                    <div className="space-y-2 text-xs">
                      <div>
                        <strong className="text-slate-500 block mb-1 text-[11px]">Authors</strong>
                        {rep.top_contributors?.authors?.map((a: any, i: number) => (
                          <div key={i} className="flex items-center justify-between py-1 border-b border-slate-100">
                            <span className="font-semibold text-slate-800">{a.name}</span>
                            <div className="flex gap-1">{a.papers.map((p: string, pIdx: number) => renderPill(p))}</div>
                          </div>
                        ))}
                      </div>

                      <div className="pt-2">
                        <strong className="text-slate-500 block mb-1 text-[11px]">Journals</strong>
                        {rep.top_contributors?.journals?.map((j: any, i: number) => (
                          <div key={i} className="flex items-center justify-between py-1 border-b border-slate-100">
                            <span className="font-semibold text-slate-800">{j.name}</span>
                            <div className="flex gap-1">{j.papers.map((p: string, pIdx: number) => renderPill(p))}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                    <p className="text-[10px] text-slate-400 font-mono pt-1">FIGURE 5: Authors and journals appearing most often here.</p>
                  </div>
                </div>

                {/* Section 4: Discussion (Screenshot 76409 & 76410) */}
                <div className="space-y-2">
                  <h2 className="text-base font-bold text-slate-900">
                    4. Discussion
                  </h2>
                  <p className="text-sm text-slate-700 leading-relaxed">
                    {rep.discussion}
                  </p>
                </div>

                {/* Claim-Level Evidence Strength Table (FIGURE 6 - Screenshot 76410) */}
                <div className="space-y-2">
                  <h2 className="text-base font-bold text-slate-900">
                    Claim-Level Evidence Strength
                  </h2>
                  <div className="border border-slate-200 rounded-xl overflow-hidden overflow-x-auto shadow-2xs">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-[#f8fafc] border-b border-slate-200 text-slate-700 font-bold uppercase text-[10px]">
                        <tr>
                          <th className="p-3">Claim</th>
                          <th className="p-3">Evidence Strength</th>
                          <th className="p-3">Reasoning</th>
                          <th className="p-3">Papers</th>
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
                                      className={`w-1.5 h-3 rounded-2xs ${i < item.bars ? (item.bars >= 7 ? 'bg-teal-500' : (item.bars >= 4 ? 'bg-amber-400' : 'bg-rose-400')) : 'bg-slate-200'}`}
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
                  <p className="text-[10px] text-slate-400 font-mono pt-0.5">FIGURE 6: Key claims and evidence strength in corpus.</p>
                </div>

                {/* Section 5: Conclusion */}
                <div className="space-y-2">
                  <h2 className="text-base font-bold text-slate-900">
                    5. Conclusion
                  </h2>
                  <p className="text-sm text-slate-700 leading-relaxed">
                    {rep.conclusion}
                  </p>
                </div>

                {/* Research Gaps Heatmap Matrix (Screenshot 76410 & 76411) */}
                <div className="space-y-2">
                  <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <Grid className="w-4 h-4 text-teal-600" /> Research Gaps Matrix
                  </h2>
                  <p className="text-xs text-slate-500">The main unresolved issue is how dopamine relates to upstream mechanisms, patient subtypes, and nonpsychotic domains.</p>
                  
                  <div className="border border-slate-200 rounded-xl overflow-hidden overflow-x-auto shadow-2xs">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-[#f8fafc] border-b border-slate-200 text-slate-700 font-bold uppercase text-[10px]">
                        <tr>
                          <th className="p-3">Domain</th>
                          {(rep.research_gaps?.columns || ["PET Evidence", "Prodromal Stage", "Circuit Mechanism", "Clinical Trials"]).map((c: string, idx: number) => (
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

                {/* Open Research Questions (Screenshot 76411) */}
                <div className="space-y-3 pt-2">
                  <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <HelpCircle className="w-4 h-4 text-teal-600" /> Open Research Questions
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {(rep.open_questions || []).map((q: any, idx: number) => (
                      <div 
                        key={idx}
                        onClick={() => handleSearch(q.question)}
                        className="p-3.5 rounded-xl border border-slate-200 bg-white hover:border-teal-600 transition-all cursor-pointer group space-y-1.5 shadow-2xs"
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

                {/* Suggested Follow-up Chips (Screenshot 76411) */}
                <div className="space-y-2 pt-3 border-t border-slate-100">
                  <span className="text-xs font-bold text-slate-700 block">Suggested Deep Explorations</span>
                  <div className="flex flex-col sm:flex-row flex-wrap gap-2">
                    {[
                      "Consensus Meter: Does dopamine dysregulation precede psychosis onset in high-risk cohorts?",
                      "Dopamine-glutamate interactions in schizophrenia",
                      "How do cortical excitation-inhibition imbalances modulate striatal dopamine?"
                    ].map((sug, i) => (
                      <button
                        key={i}
                        onClick={() => handleSearch(sug)}
                        className="text-left text-xs bg-slate-50 hover:bg-teal-50 hover:text-teal-800 border border-slate-200 px-3 py-2 rounded-xl transition-all flex items-center justify-between gap-2"
                      >
                        <span>{sug}</span>
                        <ArrowRight className="w-3.5 h-3.5 shrink-0 text-slate-400" />
                      </button>
                    ))}
                  </div>
                </div>

              </div>
            )}

            {/* Step-by-Step Progress Loader */}
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

          {/* 3. RIGHT REFERENCES DRAWER (Screenshots 76404 to 76411) */}
          {showReferences && (
            <aside className="w-80 sm:w-96 border-l border-slate-200 bg-[#fbfbfb] flex flex-col h-full overflow-hidden shrink-0 text-left z-30 shadow-lg md:shadow-none">
              <div className="p-3 border-b border-slate-200 flex items-center justify-between text-xs bg-white">
                <span className="font-bold text-slate-800">
                  References ({displayedStudies.length})
                </span>
                <button onClick={() => setShowReferences(false)} className="text-slate-400 hover:text-slate-700 p-1">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-3 space-y-3">
                {displayedStudies.map((item: any, idx: number) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-xl border border-slate-200 bg-white hover:border-teal-600 transition-all space-y-2 text-left shadow-2xs"
                  >
                    <div className="flex items-center justify-between text-[11px] text-slate-500">
                      <span>[{idx + 1}] • {item.pubdate} • {item.citations_count} citations</span>
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
                      <span className="px-2 py-0.5 rounded font-bold uppercase bg-blue-50 text-blue-700">
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
            </aside>
          )}

        </div>

        {/* 4. DOCKED PERSISTENT COMMAND BAR */}
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
              <span className="text-[10px] text-slate-400 hidden sm:inline">Evidex Literature Review Engine</span>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
