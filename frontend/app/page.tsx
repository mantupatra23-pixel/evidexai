"use client";

import { useState } from "react";
import { 
  Search, ArrowRight, ExternalLink, ShieldAlert, CheckCircle2, Lock, 
  Plus, Home as HomeIcon, Filter, Database, Scale, Table, FileText, 
  Sparkles, Check, HelpCircle, ChevronRight, Menu, X
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
    <div className="min-h-screen bg-black text-zinc-100 flex flex-col md:flex-row font-sans selection:bg-[#00FF66] selection:text-black">
      
      {/* 1. Left Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-zinc-950 border-r border-zinc-900 flex flex-col justify-between p-4 transition-transform duration-200 md:translate-x-0 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 font-black text-lg tracking-wider">
              <span className="w-2.5 h-2.5 rounded-full bg-[#00FF66] shadow-[0_0_10px_#00FF66]" />
              EVIDEX<span className="text-[#00FF66]">.AI</span>
            </div>
            <button onClick={() => setSidebarOpen(false)} className="md:hidden text-zinc-400">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="space-y-2">
            <button 
              onClick={() => { setData(null); setQuery(""); }}
              className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-xs font-semibold text-zinc-200 transition-all"
            >
              <Plus className="w-4 h-4 text-[#00FF66]" /> New Search
            </button>
            <button className="w-full flex items-center gap-3 py-2 px-3 rounded-xl bg-zinc-900/40 text-xs font-medium text-zinc-400 hover:text-zinc-200">
              <HomeIcon className="w-4 h-4 text-[#00FF66]" /> Home
            </button>
          </div>

          <div className="pt-4 border-t border-zinc-900 space-y-3">
            <h4 className="text-[11px] font-bold uppercase tracking-wider text-zinc-500">Research starts here</h4>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Search & analyze 35M+ peer-reviewed PubMed clinical trials with zero hallucination.
            </p>
          </div>
        </div>

        <div className="pt-4 border-t border-zinc-900 space-y-2">
          <button className="w-full py-2 text-xs font-medium text-zinc-400 hover:text-white transition-colors text-center block">
            Sign In
          </button>
          <button className="w-full py-2 rounded-xl bg-[#00FF66] text-black text-xs font-bold hover:bg-[#00e65c] transition-all shadow-[0_0_15px_rgba(0,255,102,0.2)]">
            Sign Up
          </button>
        </div>
      </aside>

      {/* 2. Main Content Area */}
      <main className="flex-1 md:ml-64 flex flex-col items-center px-4 py-8 md:py-16 max-w-5xl mx-auto w-full relative">
        {/* Mobile Header Bar */}
        <div className="w-full flex items-center justify-between md:hidden mb-6">
          <button onClick={() => setSidebarOpen(true)} className="p-2 text-zinc-400 hover:text-white">
            <Menu className="w-6 h-6" />
          </button>
          <span className="font-bold text-sm tracking-wider">EVIDEX<span className="text-[#00FF66]">.AI</span></span>
          <button className="px-3 py-1 bg-[#00FF66] text-black rounded-lg text-xs font-bold">Sign up</button>
        </div>

        {/* Ambient Glow */}
        <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[350px] md:w-[600px] h-[250px] bg-[#00FF66]/10 blur-[130px] rounded-full pointer-events-none" />

        {/* Hero Title */}
        <div className="text-center space-y-3 mb-8 z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-zinc-800 bg-zinc-950 text-xs font-medium text-zinc-400">
            <span className="w-2 h-2 rounded-full bg-[#00FF66] animate-pulse" />
            35M+ PubMed Clinical Papers Indexed
          </div>
          <h1 className="text-4xl sm:text-6xl font-black tracking-tight">
            Evidence starts <span className="text-[#00FF66]">here.</span>
          </h1>
          <p className="text-zinc-400 text-sm sm:text-base max-w-lg mx-auto">
            Search peer-reviewed medical trials, extract clinical sample sizes, and verify outcomes.
          </p>
        </div>

        {/* Search Engine Bar */}
        <div className="w-full max-w-2xl bg-zinc-950 border border-zinc-800 focus-within:border-[#00FF66] rounded-2xl p-2.5 transition-all shadow-2xl z-10">
          <div className="flex items-center px-3">
            <Search className="w-5 h-5 text-zinc-500 mr-3 shrink-0" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              placeholder="Ask a clinical question (e.g. Metformin in CKD stage 3)..."
              className="w-full bg-transparent text-sm sm:text-base text-zinc-100 placeholder-zinc-500 focus:outline-none"
            />
            <button
              onClick={() => handleSearch()}
              disabled={loading || !query.trim()}
              className="p-2.5 rounded-xl bg-[#00FF66] text-black font-semibold hover:bg-[#00e65c] transition-all disabled:opacity-30 shrink-0 shadow-[0_0_12px_rgba(0,255,102,0.3)]"
            >
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <div className="flex items-center gap-2 pt-2 mt-2 border-t border-zinc-900 px-2 text-xs text-zinc-400">
            <span className="inline-flex items-center gap-1 bg-zinc-900 px-2 py-1 rounded-md border border-zinc-800">
              <Database className="w-3 h-3 text-[#00FF66]" /> Corpus: PubMed
            </span>
            <span className="inline-flex items-center gap-1 bg-zinc-900 px-2 py-1 rounded-md border border-zinc-800">
              <Filter className="w-3 h-3 text-zinc-400" /> Filters
            </span>
          </div>
        </div>

        {/* Quick Action Suggestions */}
        <div className="flex flex-wrap items-center justify-center gap-2 mt-4 z-10">
          {quickActions.map((action, idx) => {
            const Icon = action.icon;
            return (
              <button
                key={idx}
                onClick={() => handleSearch(action.label)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-zinc-800 bg-zinc-950/80 hover:border-[#00FF66]/50 text-zinc-400 hover:text-zinc-100 text-xs transition-all"
              >
                <Icon className="w-3.5 h-3.5 text-[#00FF66]" />
                {action.label}
              </button>
            );
          })}
        </div>

        {/* Search Results Display */}
        {loading && (
          <div className="mt-12 text-sm text-zinc-400 flex items-center gap-2 z-10">
            <span className="w-2.5 h-2.5 rounded-full bg-[#00FF66] animate-ping" />
            Scanning PubMed clinical trials...
          </div>
        )}

        {data && (
          <div className="w-full max-w-2xl mt-8 space-y-6 text-left z-10">
            {/* AI Summary Box */}
            <div className="p-6 rounded-2xl bg-zinc-950 border border-zinc-800">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#00FF66] mb-3 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" /> Clinical Synthesis
              </h3>
              <p className="text-sm text-zinc-300 leading-relaxed whitespace-pre-line">{data.summary}</p>
            </div>

            {/* Blurred Premium Analytics Feature */}
            <div className="relative rounded-2xl border border-zinc-800 bg-zinc-950 p-6 overflow-hidden">
              <div className="filter blur-sm select-none opacity-40">
                <h4 className="font-bold text-sm mb-2">Pharma Funding Bias & Risk Analysis</h4>
                <p className="text-xs text-zinc-400">Independent vs Industry Sponsored clinical trial audit.</p>
                <div className="h-12 bg-zinc-900 rounded-lg mt-3" />
              </div>
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/70 backdrop-blur-xs">
                <Lock className="w-5 h-5 text-[#00FF66] mb-2" />
                <span className="text-xs font-semibold text-zinc-200">Unlock Full Meta-Analysis & Bias Audit</span>
                <button className="mt-2.5 px-4 py-1.5 rounded-xl bg-[#00FF66] text-black text-xs font-bold hover:bg-[#00e65c]">
                  Upgrade to Pro
                </button>
              </div>
            </div>

            {/* Study Citations List */}
            <div className="space-y-3">
              <h3 className="text-xs uppercase font-bold text-zinc-500 tracking-wider">Referenced Studies ({data.total_studies_scanned})</h3>
              {data.studies.map((item: any) => (
                <a
                  key={item.pmid}
                  href={item.url}
                  target="_blank"
                  rel="noreferrer"
                  className="block p-4 rounded-xl border border-zinc-800/80 bg-zinc-950 hover:border-[#00FF66]/50 transition-all"
                >
                  <div className="text-sm font-medium text-zinc-200">{item.title}</div>
                  <div className="flex items-center gap-3 mt-2 text-xs text-zinc-500">
                    <span>{item.source}</span>
                    <span>•</span>
                    <span>PMID: {item.pmid}</span>
                    <ExternalLink className="w-3 h-3 text-[#00FF66] ml-auto" />
                  </div>
                </a>
              ))}
            </div>
          </div>
        )}

        {/* 3. Below Hero: Features & Evidence Showcases (Consensus Style) */}
        {!data && (
          <div className="w-full max-w-2xl mt-16 space-y-12 z-10 text-left">
            
            {/* Trusted Corpus Strip */}
            <div className="border-t border-b border-zinc-900 py-6 text-center space-y-3">
              <span className="text-[11px] uppercase tracking-widest text-zinc-500 font-semibold">Indexed Medical Corpora</span>
              <div className="flex flex-wrap items-center justify-center gap-6 text-zinc-400 font-mono text-xs">
                <span className="hover:text-[#00FF66] transition-colors">PUBMED CENTRAL</span>
                <span>•</span>
                <span className="hover:text-[#00FF66] transition-colors">NCBI ENTREZ</span>
                <span>•</span>
                <span className="hover:text-[#00FF66] transition-colors">MEDRXIV</span>
                <span>•</span>
                <span className="hover:text-[#00FF66] transition-colors">OPENALEX</span>
              </div>
            </div>

            {/* Medical Mode Section */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#00FF66]" />
                <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-300">Try Medical Mode</h3>
              </div>
              <p className="text-xs text-zinc-500">Instant answers from clinical guidelines and top medical journals.</p>
              <div className="space-y-2">
                {medicalQueries.map((item, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSearch(item)}
                    className="w-full flex items-center justify-between p-3.5 rounded-xl border border-zinc-800 bg-zinc-950 hover:border-zinc-700 text-xs text-zinc-300 transition-all text-left group"
                  >
                    <span>{item}</span>
                    <ChevronRight className="w-4 h-4 text-zinc-600 group-hover:text-[#00FF66] transition-colors" />
                  </button>
                ))}
              </div>
            </div>

            {/* Evidence Consensus Meter Preview */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-[#00FF66]" />
                <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-300">See Where Research Agrees</h3>
              </div>
              <div className="p-5 rounded-2xl border border-zinc-800 bg-zinc-950 space-y-4">
                <div className="text-xs text-zinc-300 font-medium">
                  "Does intermittent fasting reduce systemic inflammation in adults?"
                </div>
                <div className="space-y-1.5">
                  <div className="flex justify-between text-[11px] font-mono text-zinc-400">
                    <span className="text-[#00FF66]">78% Yes</span>
                    <span>14% Inconclusive</span>
                    <span className="text-zinc-500">8% No</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-zinc-900 flex overflow-hidden">
                    <div className="bg-[#00FF66] h-full" style={{ width: "78%" }} />
                    <div className="bg-zinc-700 h-full" style={{ width: "14%" }} />
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
