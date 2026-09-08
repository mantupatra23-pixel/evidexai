"use client";

import { useState } from "react";
import { 
  Search, ArrowRight, ExternalLink, CheckCircle2, Lock, 
  Plus, Home as HomeIcon, Filter, Database, Scale, Table, FileText, 
  Sparkles, Check, ChevronRight, Menu, X, BookOpen, Download, Copy, CheckCheck
} from "lucide-react";

export default function Home() {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<any>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [copiedPmid, setCopiedPmid] = useState<string | null>(null);

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
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "https://evidexai.onrender.com";
      const res = await fetch(`${apiUrl}/api/search?q=${encodeURIComponent(q)}`);
      const json = await res.json();
      setData(json);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const copyCitation = async (pmid: string) => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "https://evidexai.onrender.com";
      const res = await fetch(`${apiUrl}/api/export?pmids=${pmid}&format=apa`);
      const text = await res.text();
      await navigator.clipboard.writeText(text);
      setCopiedPmid(pmid);
      setTimeout(() => setCopiedPmid(null), 2500);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans flex flex-col selection:bg-blue-100 selection:text-blue-900 overflow-x-hidden">
      
      {/* 1. Backdrop Overlay */}
      {sidebarOpen && (
        <div 
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-40 transition-opacity"
        />
      )}

      {/* 2. Slide Drawer */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-72 bg-slate-50 border-r border-slate-200 p-5 flex flex-col justify-between transition-transform duration-300 shadow-2xl ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200">
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
              onClick={() => { setData(null); setQuery(""); setSidebarOpen(false); }}
              className="w-full flex items-center gap-2.5 py-2 px-3 rounded-lg bg-white border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-all shadow-2xs"
            >
              <Plus className="w-4 h-4 text-[#0080ff]" /> New Search
            </button>
            <button 
              onClick={() => setSidebarOpen(false)}
              className="w-full flex items-center gap-2.5 py-2 px-3 rounded-lg text-xs font-medium text-slate-600 hover:bg-slate-200/50"
            >
              <HomeIcon className="w-4 h-4 text-slate-500" /> Home
            </button>
          </div>

          <div className="pt-4 border-t border-slate-200 space-y-2">
            <h4 className="text-xs font-bold text-slate-900">Research starts here</h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              Evidex indexes 35M+ PubMed trials and extracts clinical endpoints with zero hallucination.
            </p>
          </div>
        </div>

        <div className="pt-4 border-t border-slate-200 space-y-2">
          <button className="w-full py-2 text-xs font-semibold text-slate-600 hover:text-slate-900">
            Sign in
          </button>
          <button className="w-full py-2 rounded-xl bg-[#0080ff] text-white text-xs font-bold hover:bg-[#0070e0] shadow-xs">
            Sign up
          </button>
        </div>
      </aside>

      {/* 3. Safe Sticky Header Bar */}
      <header className="h-14 border-b border-slate-200/80 px-4 flex items-center justify-between sticky top-0 bg-white/95 backdrop-blur-md z-30">
        <div className="flex items-center gap-2.5">
          <button 
            onClick={() => setSidebarOpen(true)}
            className="p-1.5 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-md bg-[#0080ff] text-white flex items-center justify-center text-xs font-black">E</span>
            <span className="font-bold text-base text-slate-900">Evidex</span>
          </div>
        </div>

        <button className="px-3.5 py-1.5 rounded-lg bg-[#0080ff] text-white text-xs font-bold hover:bg-[#0070e0] transition-all shadow-xs">
          Sign up
        </button>
      </header>

      {/* 4. Main Page Container */}
      <main className="flex-1 flex flex-col items-center px-4 py-8 md:py-14 max-w-3xl mx-auto w-full">
        
        {/* Brand Header */}
        <div className="text-center space-y-2 mb-6">
          <div className="inline-flex items-center gap-2 text-slate-900 font-bold text-sm">
            <span className="w-4 h-4 rounded-full bg-teal-500 text-white flex items-center justify-center text-[9px]">C</span>
            <span>Evidex</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-slate-900">
            Research starts here
          </h1>
        </div>

        {/* Responsive Search Box */}
        <div className="w-full bg-white border border-slate-300 focus-within:border-[#0080ff] focus-within:ring-2 focus-within:ring-blue-100 rounded-2xl p-2.5 transition-all shadow-sm">
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              placeholder="Ask a clinical question..."
              className="flex-1 bg-transparent text-sm sm:text-base text-slate-800 placeholder-slate-400 focus:outline-none min-w-0"
            />
            <button
              onClick={() => handleSearch()}
              disabled={loading || !query.trim()}
              className="w-9 h-9 rounded-xl bg-[#0080ff] text-white flex items-center justify-center hover:bg-[#0070e0] transition-all disabled:opacity-30 shrink-0 shadow-xs"
            >
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <div className="flex items-center justify-between pt-2.5 mt-2 border-t border-slate-100 text-xs text-slate-500">
            <span className="inline-flex items-center gap-1.5 bg-slate-50 px-2.5 py-1 rounded-md border border-slate-200 font-medium">
              <Database className="w-3.5 h-3.5 text-[#0080ff]" /> Corpus: PubMed Human
            </span>
            <button className="flex items-center gap-1 text-slate-600 hover:text-slate-900 font-medium pr-1">
              <Filter className="w-3.5 h-3.5" /> Filters
            </button>
          </div>
        </div>

        {/* Suggestion Pills */}
        <div className="flex flex-wrap items-center justify-center gap-2 mt-3 w-full">
          {quickActions.map((action, idx) => {
            const Icon = action.icon;
            return (
              <button
                key={idx}
                onClick={() => handleSearch(action.label)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 hover:text-slate-900 text-xs font-medium transition-all shadow-2xs"
              >
                <Icon className="w-3.5 h-3.5 text-slate-400" />
                <span>{action.label}</span>
              </button>
            );
          })}
        </div>

        {/* Loading Spinner */}
        {loading && (
          <div className="mt-8 text-xs text-slate-600 font-medium flex items-center gap-2 bg-slate-50 border border-slate-200 px-4 py-2 rounded-full">
            <span className="w-2 h-2 rounded-full bg-[#0080ff] animate-ping" />
            Extracting PubMed clinical abstracts & statistics...
          </div>
        )}

        {/* Search Results Display */}
        {data && (
          <div className="w-full mt-8 space-y-5 text-left">
            
            {/* Dynamic Consensus Agreement Meter */}
            {data.consensus && (
              <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-2.5 shadow-xs">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                    <Check className="w-4 h-4 text-emerald-600" /> Research Consensus
                  </span>
                  <span className="text-[11px] text-slate-500">{data.total_studies_scanned} human trials</span>
                </div>
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs font-mono font-semibold">
                    <span className="text-emerald-600">{data.consensus.yes}% Yes</span>
                    <span className="text-slate-500">{data.consensus.inconclusive}% Inconclusive</span>
                    <span className="text-rose-500">{data.consensus.no}% No</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-100 flex overflow-hidden border border-slate-200">
                    <div className="bg-emerald-500 h-full" style={{ width: `${data.consensus.yes}%` }} />
                    <div className="bg-slate-300 h-full" style={{ width: `${data.consensus.inconclusive}%` }} />
                    <div className="bg-rose-400 h-full" style={{ width: `${data.consensus.no}%` }} />
                  </div>
                </div>
              </div>
            )}

            {/* AI Synthesis Box */}
            <div className="p-5 rounded-xl bg-white border border-slate-200 shadow-xs">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#0080ff] mb-2 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" /> Clinical Synthesis
              </h3>
              <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">{data.summary}</p>
            </div>

            {/* Blurred Paywall Analysis */}
            <div className="relative rounded-xl border border-slate-200 bg-white p-5 overflow-hidden shadow-2xs">
              <div className="filter blur-sm select-none opacity-40">
                <h4 className="font-bold text-sm text-slate-800 mb-1">Pharma Funding Bias & Risk Analysis</h4>
                <p className="text-xs text-slate-500">Commercial Conflict of Interest (COI) audit across scanned trials.</p>
                <div className="h-8 bg-slate-100 rounded-lg mt-2" />
              </div>
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/85 backdrop-blur-xs">
                <Lock className="w-5 h-5 text-[#0080ff] mb-1" />
                <span className="text-xs font-bold text-slate-800">Unlock Full Conflict & Bias Audit</span>
                <button className="mt-2 px-3.5 py-1.5 rounded-lg bg-[#0080ff] text-white text-xs font-bold hover:bg-[#0070e0] shadow-xs">
                  Upgrade to Pro
                </button>
              </div>
            </div>

            {/* Studies List */}
            <div className="space-y-3">
              <h3 className="text-xs uppercase font-bold text-slate-400 tracking-wider">Scanned Human Trials ({data.total_studies_scanned})</h3>
              {data.studies.map((item: any) => (
                <div
                  key={item.pmid}
                  className="p-4 rounded-xl border border-slate-200 bg-white hover:border-[#0080ff] transition-all space-y-2 shadow-2xs"
                >
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 text-[10px] font-bold">
                      {item.badge}
                    </span>
                    <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-600 text-[10px] font-medium">
                      {item.sample_size}
                    </span>
                    {item.statistics?.p_value && (
                      <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 text-[10px] font-mono">
                        {item.statistics.p_value}
                      </span>
                    )}
                  </div>

                  <a 
                    href={item.url} 
                    target="_blank" 
                    rel="noreferrer"
                    className="block text-sm font-semibold text-slate-900 hover:text-[#0080ff] leading-snug"
                  >
                    {item.title}
                  </a>

                  <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                    {item.abstract}
                  </p>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs text-slate-500">
                    <span className="truncate pr-2 font-medium">{item.source} • {item.pubdate}</span>

                    <div className="flex items-center gap-1.5 shrink-0">
                      {item.pdf_url && (
                        <a
                          href={item.pdf_url}
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 text-[11px] font-semibold hover:bg-emerald-100"
                        >
                          <Download className="w-3 h-3" /> PDF
                        </a>
                      )}
                      
                      <button
                        onClick={() => copyCitation(item.pmid)}
                        className="flex items-center gap-1 px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-[11px] font-medium hover:bg-slate-200"
                      >
                        {copiedPmid === item.pmid ? <CheckCheck className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                        <span>{copiedPmid === item.pmid ? "Copied" : "Cite"}</span>
                      </button>

                      <a href={item.url} target="_blank" rel="noreferrer" className="p-1 text-slate-400 hover:text-[#0080ff]">
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>

          </div>
        )}

        {/* 5. Landing Sections */}
        {!data && (
          <div className="w-full mt-12 space-y-10 text-left">
            
            {/* Publisher Strip */}
            <div className="border-t border-b border-slate-100 py-6 text-center space-y-2">
              <span className="text-[11px] uppercase tracking-wider font-semibold text-slate-500">Indexed In Top Medical Corpora</span>
              <div className="flex flex-wrap items-center justify-center gap-4 text-slate-700 font-serif text-xs font-semibold">
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

            {/* Deep Search Section */}
            <div className="space-y-2.5">
              <div className="flex items-center gap-1.5">
                <BookOpen className="w-4 h-4 text-[#0080ff]" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">Automate Review with Deep Search</h3>
              </div>
              <div className="space-y-2">
                {deepSearchQueries.map((item, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSearch(item)}
                    className="w-full flex items-center justify-between p-3 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-100 text-xs text-slate-700 font-medium transition-all text-left group"
                  >
                    <span className="truncate pr-2">{item}</span>
                    <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-[#0080ff] shrink-0" />
                  </button>
                ))}
              </div>
            </div>

            {/* Try Medical Mode */}
            <div className="space-y-2.5">
              <div className="flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-teal-600" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">Try Medical Mode</h3>
              </div>
              <div className="space-y-2">
                {medicalQueries.map((item, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSearch(item)}
                    className="w-full flex items-center justify-between p-3 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-100 text-xs text-slate-700 font-medium transition-all text-left group"
                  >
                    <span className="truncate pr-2">{item}</span>
                    <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-teal-600 shrink-0" />
                  </button>
                ))}
              </div>
            </div>

          </div>
        )}

      </main>
    </div>
  );
}
