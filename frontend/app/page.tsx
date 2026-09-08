"use client";

import { useState } from "react";
import { 
  Search, ArrowRight, ExternalLink, ShieldAlert, CheckCircle2, Lock, 
  Plus, Home as HomeIcon, Filter, Database, Scale, Table, FileText, 
  Sparkles, Check, ChevronRight, Menu, X
} from "lucide-react";

export default function Home() {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<any>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const quickActions = [
    { label: "Compare two treatments", icon: Scale },
    { label: "Build comparison table", icon: Table },
    { label: "Draft clinical report", icon: FileText },
    { label: "Check pharma bias", icon: ShieldAlert },
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

  return (
    <div className="min-h-screen bg-black text-white flex flex-col font-sans selection:bg-[#00FF66] selection:text-black">
      
      {/* 1. Backdrop Overlay (Drawer Open Hone Par Click Karke Close Hoga) */}
      {sidebarOpen && (
        <div 
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-40 transition-opacity"
        />
      )}

      {/* 2. Slide-over Sidebar Drawer */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-72 bg-zinc-950 border-r border-zinc-800 p-5 flex flex-col justify-between transition-transform duration-300 ease-in-out shadow-2xl ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-zinc-800">
            <div className="flex items-center gap-2 font-black text-lg tracking-wider text-white">
              <span className="w-3 h-3 rounded-full bg-[#00FF66] shadow-[0_0_10px_#00FF66]" />
              EVIDEX<span className="text-[#00FF66]">.AI</span>
            </div>
            <button 
              onClick={() => setSidebarOpen(false)} 
              className="p-1.5 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="space-y-2">
            <button 
              onClick={() => { setData(null); setQuery(""); setSidebarOpen(false); }}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-xs font-bold text-white transition-all shadow-sm"
            >
              <Plus className="w-4 h-4 text-[#00FF66]" /> New Search
            </button>
            <button 
              onClick={() => setSidebarOpen(false)}
              className="w-full flex items-center gap-3 py-2 px-3 rounded-xl bg-zinc-900/50 text-xs font-semibold text-zinc-300 hover:text-white"
            >
              <HomeIcon className="w-4 h-4 text-[#00FF66]" /> Home
            </button>
          </div>

          <div className="pt-4 border-t border-zinc-800 space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#00FF66]">About Platform</h4>
            <p className="text-xs text-zinc-300 leading-relaxed font-normal">
              Search & analyze 35M+ peer-reviewed PubMed clinical trials with zero hallucination.
            </p>
          </div>
        </div>

        <div className="pt-4 border-t border-zinc-800 space-y-2">
          <button className="w-full py-2 text-xs font-bold text-zinc-300 hover:text-white transition-colors text-center block">
            Sign In
          </button>
          <button className="w-full py-2.5 rounded-xl bg-[#00FF66] text-black text-xs font-extrabold hover:bg-[#00e65c] transition-all shadow-[0_0_15px_rgba(0,255,102,0.3)]">
            Sign Up
          </button>
        </div>
      </aside>

      {/* 3. Top Navigation Bar (Mobile & Desktop) */}
      <header className="w-full flex items-center justify-between px-4 py-3 border-b border-zinc-800 bg-black/90 backdrop-blur-md sticky top-0 z-30">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setSidebarOpen(true)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-xs font-semibold text-white transition-all"
          >
            <Menu className="w-4 h-4 text-[#00FF66]" />
            <span>Menu</span>
          </button>
          <span className="font-black text-base tracking-wider text-white">
            EVIDEX<span className="text-[#00FF66]">.AI</span>
          </span>
        </div>

        <button className="px-3.5 py-1.5 rounded-xl bg-[#00FF66] text-black text-xs font-extrabold hover:bg-[#00e65c] transition-all shadow-[0_0_12px_rgba(0,255,102,0.25)]">
          Sign Up
        </button>
      </header>

      {/* 4. Full Width Central Hero */}
      <main className="flex-1 flex flex-col items-center px-4 py-10 max-w-4xl mx-auto w-full relative">
        
        {/* Background Ambient Glow */}
        <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[300px] sm:w-[550px] h-[250px] bg-[#00FF66]/15 blur-[140px] rounded-full pointer-events-none" />

        {/* Hero Title */}
        <div className="text-center space-y-3 mb-8 z-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-zinc-700 bg-zinc-900 text-xs font-bold text-zinc-200 shadow-md">
            <span className="w-2 h-2 rounded-full bg-[#00FF66] animate-pulse shadow-[0_0_8px_#00FF66]" />
            35M+ PubMed Clinical Papers Indexed
          </div>
          <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-white">
            Evidence starts <span className="text-[#00FF66]">here.</span>
          </h1>
          <p className="text-zinc-200 text-sm sm:text-base font-normal max-w-lg mx-auto">
            Search peer-reviewed medical trials, extract clinical sample sizes, and verify outcomes.
          </p>
        </div>

        {/* Search Engine Input Bar */}
        <div className="w-full max-w-2xl bg-zinc-950 border-2 border-zinc-700 focus-within:border-[#00FF66] rounded-2xl p-2.5 transition-all shadow-[0_0_25px_rgba(0,0,0,0.8)] z-10">
          <div className="flex items-center px-3 py-1">
            <Search className="w-5 h-5 text-zinc-300 mr-3 shrink-0" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              placeholder="Ask a clinical question (e.g. Metformin in CKD stage 3)..."
              className="w-full bg-transparent text-sm sm:text-base text-white placeholder-zinc-400 font-medium focus:outline-none"
            />
            <button
              onClick={() => handleSearch()}
              disabled={loading || !query.trim()}
              className="p-2.5 rounded-xl bg-[#00FF66] text-black font-extrabold hover:bg-[#00e65c] transition-all disabled:opacity-30 shrink-0 shadow-[0_0_12px_rgba(0,255,102,0.4)]"
            >
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <div className="flex items-center gap-2 pt-2.5 mt-2 border-t border-zinc-800/80 px-2 text-xs">
            <span className="inline-flex items-center gap-1.5 bg-zinc-900 px-2.5 py-1 rounded-md border border-zinc-700 text-zinc-200 font-medium">
              <Database className="w-3.5 h-3.5 text-[#00FF66]" /> Corpus: PubMed
            </span>
            <span className="inline-flex items-center gap-1.5 bg-zinc-900 px-2.5 py-1 rounded-md border border-zinc-700 text-zinc-300 font-medium">
              <Filter className="w-3.5 h-3.5 text-zinc-300" /> Filters
            </span>
          </div>
        </div>

        {/* Quick Action Suggestion Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-2 mt-4 z-10 w-full">
          {quickActions.map((action, idx) => {
            const Icon = action.icon;
            return (
              <button
                key={idx}
                onClick={() => handleSearch(action.label)}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-zinc-700 bg-zinc-900 hover:border-[#00FF66] hover:bg-zinc-800 text-zinc-200 hover:text-white text-xs font-semibold transition-all shadow-sm"
              >
                <Icon className="w-3.5 h-3.5 text-[#00FF66]" />
                {action.label}
              </button>
            );
          })}
        </div>

        {/* Loading Spinner */}
        {loading && (
          <div className="mt-12 text-sm text-white font-medium flex items-center gap-2 z-10 bg-zinc-900 border border-zinc-700 px-4 py-2 rounded-full shadow-lg">
            <span className="w-2.5 h-2.5 rounded-full bg-[#00FF66] animate-ping" />
            Scanning 35M+ PubMed trials...
          </div>
        )}

        {/* Search Results Display */}
        {data && (
          <div className="w-full max-w-2xl mt-8 space-y-6 text-left z-10">
            {/* AI Summary Card */}
            <div className="p-6 rounded-2xl bg-zinc-950 border border-zinc-700 shadow-xl">
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-[#00FF66] mb-3 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" /> Clinical Synthesis
              </h3>
              <p className="text-sm text-zinc-100 font-normal leading-relaxed whitespace-pre-line">{data.summary}</p>
            </div>

            {/* Blurred Premium Feature */}
            <div className="relative rounded-2xl border border-zinc-700 bg-zinc-950 p-6 overflow-hidden shadow-xl">
              <div className="filter blur-sm select-none opacity-40">
                <h4 className="font-bold text-sm text-white mb-2">Pharma Funding Bias & Risk Analysis</h4>
                <p className="text-xs text-zinc-300">Independent vs Industry Sponsored clinical trial audit.</p>
                <div className="h-12 bg-zinc-800 rounded-lg mt-3" />
              </div>
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/75 backdrop-blur-xs">
                <Lock className="w-6 h-6 text-[#00FF66] mb-2" />
                <span className="text-xs sm:text-sm font-bold text-white">Unlock Full Meta-Analysis & Bias Audit</span>
                <button className="mt-3 px-4 py-1.5 rounded-xl bg-[#00FF66] text-black text-xs font-black hover:bg-[#00e65c] shadow-[0_0_15px_rgba(0,255,102,0.4)]">
                  Upgrade to Pro
                </button>
              </div>
            </div>

            {/* Citations List */}
            <div className="space-y-3">
              <h3 className="text-xs uppercase font-extrabold text-zinc-400 tracking-wider">Referenced Studies ({data.total_studies_scanned})</h3>
              {data.studies.map((item: any) => (
                <a
                  key={item.pmid}
                  href={item.url}
                  target="_blank"
                  rel="noreferrer"
                  className="block p-4 rounded-xl border border-zinc-800 bg-zinc-950 hover:border-[#00FF66] hover:bg-zinc-900/60 transition-all shadow-md group"
                >
                  <div className="text-sm font-semibold text-white group-hover:text-[#00FF66] transition-colors">{item.title}</div>
                  <div className="flex items-center gap-3 mt-2.5 text-xs text-zinc-300 font-medium">
                    <span className="text-zinc-400">{item.source}</span>
                    <span>•</span>
                    <span className="text-zinc-400">PMID: {item.pmid}</span>
                    <ExternalLink className="w-3.5 h-3.5 text-[#00FF66] ml-auto" />
                  </div>
                </a>
              ))}
            </div>
          </div>
        )}

        {/* 5. Below Hero Sections */}
        {!data && (
          <div className="w-full max-w-2xl mt-14 space-y-10 z-10 text-left">
            
            {/* Corpora Strip */}
            <div className="border-t border-b border-zinc-800 py-5 text-center space-y-2">
              <span className="text-[11px] uppercase tracking-widest text-[#00FF66] font-bold">Indexed Medical Corpora</span>
              <div className="flex flex-wrap items-center justify-center gap-5 text-zinc-200 font-mono text-xs font-medium">
                <span className="hover:text-[#00FF66] transition-colors">PUBMED CENTRAL</span>
                <span className="text-zinc-600">•</span>
                <span className="hover:text-[#00FF66] transition-colors">NCBI ENTREZ</span>
                <span className="text-zinc-600">•</span>
                <span className="hover:text-[#00FF66] transition-colors">MEDRXIV</span>
                <span className="text-zinc-600">•</span>
                <span className="hover:text-[#00FF66] transition-colors">OPENALEX</span>
              </div>
            </div>

            {/* Try Medical Mode */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#00FF66]" />
                <h3 className="text-xs font-black uppercase tracking-wider text-white">Try Medical Mode</h3>
              </div>
              <p className="text-xs text-zinc-300 font-normal">Instant answers from clinical guidelines and top medical journals.</p>
              <div className="space-y-2">
                {medicalQueries.map((item, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSearch(item)}
                    className="w-full flex items-center justify-between p-3.5 rounded-xl border border-zinc-800 bg-zinc-950 hover:border-[#00FF66] text-xs text-zinc-200 font-medium transition-all text-left group shadow-sm"
                  >
                    <span>{item}</span>
                    <ChevronRight className="w-4 h-4 text-zinc-400 group-hover:text-[#00FF66] transition-colors shrink-0" />
                  </button>
                ))}
              </div>
            </div>

            {/* Evidence Consensus Meter Preview */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-[#00FF66]" />
                <h3 className="text-xs font-black uppercase tracking-wider text-white">See Where Research Agrees</h3>
              </div>
              <div className="p-5 rounded-2xl border border-zinc-800 bg-zinc-950 space-y-3.5 shadow-md">
                <div className="text-xs text-white font-semibold">
                  "Does intermittent fasting reduce systemic inflammation in adults?"
                </div>
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs font-mono font-bold">
                    <span className="text-[#00FF66]">78% Yes</span>
                    <span className="text-zinc-300">14% Inconclusive</span>
                    <span className="text-zinc-400">8% No</span>
                  </div>
                  <div className="w-full h-2.5 rounded-full bg-zinc-900 border border-zinc-800 flex overflow-hidden">
                    <div className="bg-[#00FF66] h-full shadow-[0_0_8px_#00FF66]" style={{ width: "78%" }} />
                    <div className="bg-zinc-600 h-full" style={{ width: "14%" }} />
                    <div className="bg-zinc-800 h-full" style={{ width: "8%" }} />
                  </div>
                </div>
              </div>
            </div>

          </div>
        )}
      </main>
    </div>
  );
}
