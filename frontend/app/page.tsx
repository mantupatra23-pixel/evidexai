"use client";

import { useState } from "react";
import { 
  Search, ArrowRight, ExternalLink, ShieldAlert, CheckCircle2, Lock, 
  Plus, Home as HomeIcon, Filter, Database, Scale, Table, FileText, 
  Sparkles, Check, ChevronRight, Menu, X, BookOpen, Award
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

  const deepSearchQueries = [
    "Conflicting evidence on SSRIs and cardiovascular risk",
    "Clinical efficacy of intermittent fasting on metabolic markers",
    "SGLT2 inhibitors vs GLP-1 agonists for renal outcomes in type 2 diabetes",
  ];

  const medicalQueries = [
    "Duration of dual antiplatelet therapy after stent placement",
    "Antibiotic selection for community-acquired pneumonia with MRSA risk",
    "First-line biologic therapy in moderate-to-severe Crohn's disease",
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
    <div className="min-h-screen bg-[#152935] text-[#fde5d6] font-sans flex flex-col selection:bg-[#e4a576] selection:text-[#152935]">
      
      {/* 1. Backdrop Overlay */}
      {sidebarOpen && (
        <div 
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 bg-[#0c171e]/80 backdrop-blur-sm z-40 transition-opacity"
        />
      )}

      {/* 2. Slide Drawer (Sunburn Theme) */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-72 bg-[#0f1e27] border-r border-[#698ea2]/30 p-5 flex flex-col justify-between transition-transform duration-300 shadow-2xl ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="space-y-5">
          <div className="flex items-center justify-between pb-4 border-b border-[#698ea2]/20">
            <div className="flex items-center gap-2 font-black text-lg tracking-wider text-[#fde5d6]">
              <span className="w-2.5 h-2.5 rounded-full bg-[#e4a576] shadow-[0_0_10px_#e4a576]" />
              EVIDEX<span className="text-[#e4a576]">.AI</span>
            </div>
            <button onClick={() => setSidebarOpen(false)} className="p-1.5 rounded-lg bg-[#152935] border border-[#698ea2]/30 text-[#ccd5d2] hover:text-white">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="space-y-2">
            <button 
              onClick={() => { setData(null); setQuery(""); setSidebarOpen(false); }}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-[#152935] hover:bg-[#1b3443] border border-[#698ea2]/40 text-xs font-bold text-[#fde5d6] transition-all shadow-md"
            >
              <Plus className="w-4 h-4 text-[#e4a576]" /> New Search
            </button>
            <button 
              onClick={() => setSidebarOpen(false)}
              className="w-full flex items-center gap-3 py-2 px-3 rounded-xl bg-[#152935]/40 text-xs font-semibold text-[#ccd5d2] hover:text-[#fde5d6]"
            >
              <HomeIcon className="w-4 h-4 text-[#e4a576]" /> Home
            </button>
          </div>

          <div className="pt-4 border-t border-[#698ea2]/20 space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#e4a576]">Research starts here</h4>
            <p className="text-xs text-[#ccd5d2] leading-relaxed">
              Search & analyze 35M+ peer-reviewed PubMed clinical trials with zero hallucination.
            </p>
          </div>
        </div>

        <div className="p-4 bg-[#152935] rounded-2xl border border-[#698ea2]/30 space-y-2">
          <div className="flex items-center gap-2 text-xs font-bold text-[#fde5d6]">
            <Sparkles className="w-4 h-4 text-[#e4a576]" /> Evidex Pro
          </div>
          <p className="text-[11px] text-[#ccd5d2]">Unlock full meta-analysis graphs & pharma funding bias audits.</p>
          <button className="w-full py-2 rounded-xl bg-[#e4a576] text-[#152935] text-xs font-black hover:bg-[#d89766] transition-all">
            Upgrade to Pro
          </button>
        </div>
      </aside>

      {/* 3. Top Header Bar */}
      <header className="h-14 border-b border-[#698ea2]/20 px-4 flex items-center justify-between sticky top-0 bg-[#152935]/95 backdrop-blur-md z-30">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setSidebarOpen(true)}
            className="p-2 rounded-xl text-[#ccd5d2] hover:text-white hover:bg-[#1d3849] transition-colors"
          >
            <Menu className="w-5 h-5" />
          </button>
          <span className="font-black text-base tracking-wider text-[#fde5d6]">
            Evidex<span className="text-[#e4a576]">.ai</span>
          </span>
          <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#0f1e27] border border-[#698ea2]/30 text-[10px] text-[#ccd5d2]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#e4a576] animate-pulse" />
            35M+ PubMed Index
          </span>
        </div>

        <button className="px-4 py-1.5 rounded-full bg-[#e4a576] text-[#152935] text-xs font-bold hover:bg-[#d89766] transition-all shadow-[0_0_12px_rgba(228,165,118,0.25)]">
          Sign In
        </button>
      </header>

      {/* 4. Main Page Body (Center-Aligned Hero) */}
      <main className="flex-1 flex flex-col items-center px-4 py-10 md:py-16 max-w-4xl mx-auto w-full relative">
        
        {/* Ambient Glow */}
        <div className="absolute top-12 left-1/2 -translate-x-1/2 w-[350px] sm:w-[550px] h-[220px] bg-[#e4a576]/10 blur-[130px] rounded-full pointer-events-none" />

        {/* Hero Title */}
        <div className="text-center space-y-3 mb-8 z-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-[#698ea2]/30 bg-[#0f1e27] text-xs font-bold text-[#ccd5d2] shadow-sm">
            <span className="w-2 h-2 rounded-full bg-[#e4a576] animate-pulse shadow-[0_0_8px_#e4a576]" />
            35M+ PubMed Clinical Papers Indexed
          </div>
          <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-[#fde5d6]">
            Evidence starts <span className="text-[#e4a576]">here.</span>
          </h1>
          <p className="text-[#ccd5d2] text-sm sm:text-base max-w-lg mx-auto leading-relaxed">
            Search peer-reviewed medical trials, extract clinical sample sizes, and verify consensus.
          </p>
        </div>

        {/* Central Search Box (Consensus Design) */}
        <div className="w-full max-w-2xl bg-[#0f1e27] border border-[#698ea2]/40 focus-within:border-[#e4a576] rounded-2xl p-2.5 transition-all shadow-2xl z-10">
          <div className="flex items-center px-3 py-1">
            <Search className="w-5 h-5 text-[#698ea2] mr-3 shrink-0" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              placeholder="Ask a clinical question (e.g. Metformin in CKD stage 3)..."
              className="w-full bg-transparent text-sm sm:text-base text-[#fde5d6] placeholder-[#698ea2] font-medium focus:outline-none"
            />
            <button
              onClick={() => handleSearch()}
              disabled={loading || !query.trim()}
              className="p-2.5 rounded-xl bg-[#e4a576] text-[#152935] font-black hover:bg-[#d89766] transition-all disabled:opacity-30 shrink-0 shadow-[0_0_12px_rgba(228,165,118,0.3)]"
            >
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <div className="flex items-center gap-2 pt-2.5 mt-2 border-t border-[#698ea2]/20 px-2 text-xs">
            <span className="inline-flex items-center gap-1.5 bg-[#152935] px-2.5 py-1 rounded-md border border-[#698ea2]/30 text-[#ccd5d2]">
              <Database className="w-3.5 h-3.5 text-[#e4a576]" /> Corpus: PubMed
            </span>
            <span className="inline-flex items-center gap-1.5 bg-[#152935] px-2.5 py-1 rounded-md border border-[#698ea2]/30 text-[#ccd5d2]">
              <Filter className="w-3.5 h-3.5 text-[#698ea2]" /> Filters
            </span>
          </div>
        </div>

        {/* Suggestion Pills */}
        <div className="flex flex-wrap items-center justify-center gap-2 mt-4 z-10 w-full">
          {quickActions.map((action, idx) => {
            const Icon = action.icon;
            return (
              <button
                key={idx}
                onClick={() => handleSearch(action.label)}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-[#698ea2]/30 bg-[#0f1e27] hover:border-[#e4a576] text-[#ccd5d2] hover:text-[#fde5d6] text-xs font-semibold transition-all shadow-sm"
              >
                <Icon className="w-3.5 h-3.5 text-[#e4a576]" />
                {action.label}
              </button>
            );
          })}
        </div>

        {/* Loading Indicator */}
        {loading && (
          <div className="mt-12 text-sm text-[#fde5d6] font-medium flex items-center gap-2 z-10 bg-[#0f1e27] border border-[#698ea2]/40 px-4 py-2 rounded-full shadow-lg">
            <span className="w-2.5 h-2.5 rounded-full bg-[#e4a576] animate-ping" />
            Scanning 35M+ PubMed trials...
          </div>
        )}

        {/* Search Results Display */}
        {data && (
          <div className="w-full max-w-2xl mt-8 space-y-6 text-left z-10">
            {/* AI Summary Card */}
            <div className="p-6 rounded-2xl bg-[#0f1e27] border border-[#698ea2]/40 shadow-xl">
              <h3 className="text-xs font-black uppercase tracking-wider text-[#e4a576] mb-3 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" /> Clinical Synthesis
              </h3>
              <p className="text-sm text-[#fde5d6] font-normal leading-relaxed whitespace-pre-line">{data.summary}</p>
            </div>

            {/* Blurred Monetization Feature */}
            <div className="relative rounded-2xl border border-[#698ea2]/40 bg-[#0f1e27] p-6 overflow-hidden shadow-xl">
              <div className="filter blur-sm select-none opacity-30">
                <h4 className="font-bold text-sm text-[#fde5d6] mb-2">Pharma Funding Bias & Risk Analysis</h4>
                <p className="text-xs text-[#ccd5d2]">Independent vs Industry Sponsored clinical trial audit.</p>
                <div className="h-12 bg-[#152935] rounded-lg mt-3" />
              </div>
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#0c171e]/80 backdrop-blur-xs">
                <Lock className="w-6 h-6 text-[#e4a576] mb-2" />
                <span className="text-xs sm:text-sm font-bold text-[#fde5d6]">Unlock Full Meta-Analysis & Bias Audit</span>
                <button className="mt-3 px-4 py-1.5 rounded-xl bg-[#e4a576] text-[#152935] text-xs font-black hover:bg-[#d89766] shadow-md">
                  Upgrade to Pro
                </button>
              </div>
            </div>

            {/* Citations List */}
            <div className="space-y-3">
              <h3 className="text-xs uppercase font-extrabold text-[#698ea2] tracking-wider">Referenced Studies ({data.total_studies_scanned})</h3>
              {data.studies.map((item: any) => (
                <a
                  key={item.pmid}
                  href={item.url}
                  target="_blank"
                  rel="noreferrer"
                  className="block p-4 rounded-xl border border-[#698ea2]/30 bg-[#0f1e27] hover:border-[#e4a576] transition-all shadow-md group"
                >
                  <div className="text-sm font-semibold text-[#fde5d6] group-hover:text-[#e4a576] transition-colors">{item.title}</div>
                  <div className="flex items-center gap-3 mt-2.5 text-xs text-[#ccd5d2] font-medium">
                    <span className="text-[#698ea2]">{item.source}</span>
                    <span>•</span>
                    <span className="text-[#698ea2]">PMID: {item.pmid}</span>
                    <ExternalLink className="w-3.5 h-3.5 text-[#e4a576] ml-auto" />
                  </div>
                </a>
              ))}
            </div>
          </div>
        )}

        {/* 5. Below Hero Sections (Consensus Style Layout) */}
        {!data && (
          <div className="w-full max-w-2xl mt-14 space-y-12 z-10 text-left">
            
            {/* Publisher Corpora Strip */}
            <div className="border-t border-b border-[#698ea2]/20 py-6 text-center space-y-3">
              <span className="text-[11px] uppercase tracking-widest text-[#e4a576] font-bold">The New Standard For Clinical Research</span>
              <div className="flex flex-wrap items-center justify-center gap-6 text-[#ccd5d2] font-serif text-sm">
                <span className="font-bold tracking-wider">WILEY</span>
                <span>•</span>
                <span className="font-bold tracking-wider">Taylor & Francis</span>
                <span>•</span>
                <span className="font-bold tracking-wider">SAGE</span>
                <span>•</span>
                <span className="font-bold tracking-wider">AAAS</span>
                <span>•</span>
                <span className="font-bold tracking-wider">PUBMED</span>
              </div>
            </div>

            {/* Automate Literature Review Section */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-[#e4a576]" />
                <h3 className="text-xs font-black uppercase tracking-wider text-[#fde5d6]">Automate Literature Review with Deep Search</h3>
              </div>
              <p className="text-xs text-[#ccd5d2]">Turn days of literature synthesis into minutes.</p>
              <div className="space-y-2">
                {deepSearchQueries.map((item, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSearch(item)}
                    className="w-full flex items-center justify-between p-3.5 rounded-xl border border-[#698ea2]/30 bg-[#0f1e27] hover:border-[#e4a576] text-xs text-[#ccd5d2] font-medium transition-all text-left group"
                  >
                    <span>{item}</span>
                    <ChevronRight className="w-4 h-4 text-[#698ea2] group-hover:text-[#e4a576] transition-colors shrink-0" />
                  </button>
                ))}
              </div>
            </div>

            {/* Try Medical Mode */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#e4a576]" />
                <h3 className="text-xs font-black uppercase tracking-wider text-[#fde5d6]">Try Medical Mode</h3>
              </div>
              <p className="text-xs text-[#ccd5d2]">Narrow results to top clinical guidelines and trusted journals.</p>
              <div className="space-y-2">
                {medicalQueries.map((item, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSearch(item)}
                    className="w-full flex items-center justify-between p-3.5 rounded-xl border border-[#698ea2]/30 bg-[#0f1e27] hover:border-[#e4a576] text-xs text-[#ccd5d2] font-medium transition-all text-left group"
                  >
                    <span>{item}</span>
                    <ChevronRight className="w-4 h-4 text-[#698ea2] group-hover:text-[#e4a576] transition-colors shrink-0" />
                  </button>
                ))}
              </div>
            </div>

            {/* See Where Research Agrees (Consensus Meter) */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-[#e4a576]" />
                <h3 className="text-xs font-black uppercase tracking-wider text-[#fde5d6]">See Where Research Agrees</h3>
              </div>
              <div className="p-5 rounded-2xl border border-[#698ea2]/30 bg-[#0f1e27] space-y-3.5 shadow-md">
                <div className="text-xs text-[#fde5d6] font-semibold">
                  "Does intermittent fasting lead to meaningful long-term weight loss?"
                </div>
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs font-mono font-bold">
                    <span className="text-[#e4a576]">74% Yes</span>
                    <span className="text-[#ccd5d2]">18% Inconclusive</span>
                    <span className="text-[#698ea2]">8% No</span>
                  </div>
                  <div className="w-full h-2.5 rounded-full bg-[#152935] border border-[#698ea2]/30 flex overflow-hidden">
                    <div className="bg-[#e4a576] h-full shadow-[0_0_8px_#e4a576]" style={{ width: "74%" }} />
                    <div className="bg-[#698ea2] h-full" style={{ width: "18%" }} />
                    <div className="bg-[#0c171e] h-full" style={{ width: "8%" }} />
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
