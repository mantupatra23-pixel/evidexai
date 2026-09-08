"use client";

import { useState, useRef, useEffect } from "react";
import { 
  Sparkles, ArrowUp, Menu, X, Plus, ExternalLink, 
  Lock, CheckCircle2, ShieldAlert, FileText, Scale, 
  Database, RefreshCw, ChevronRight, BookOpen
} from "lucide-react";

export default function Home() {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<Array<{ role: "user" | "assistant"; content?: string; data?: any }>>([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const samplePrompts = [
    {
      title: "Compare Treatments",
      desc: "SGLT2 inhibitors vs GLP-1 in CKD Stage 3",
      icon: Scale,
      query: "SGLT2 inhibitors vs GLP-1 agonists for renal outcomes in type 2 diabetes"
    },
    {
      title: "Clinical Trial Review",
      desc: "Dual antiplatelet therapy after stent placement",
      icon: BookOpen,
      query: "Duration of dual antiplatelet therapy after stent placement"
    },
    {
      title: "Antibiotic Protocol",
      desc: "Community-acquired pneumonia with MRSA risk",
      icon: FileText,
      query: "Antibiotic selection for community-acquired pneumonia with MRSA risk"
    },
    {
      title: "Bias Risk Check",
      desc: "Intermittent fasting vs calorie restriction",
      icon: ShieldAlert,
      query: "Does intermittent fasting reduce systemic inflammation in clinical trials?"
    }
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const handleSearch = async (searchQuery?: string) => {
    const q = (searchQuery || query).trim();
    if (!q || loading) return;

    setQuery("");
    setMessages((prev) => [...prev, { role: "user", content: q }]);
    setLoading(true);

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "https://evidexai.onrender.com";
      const res = await fetch(`${apiUrl}/api/search?q=${encodeURIComponent(q)}`);
      const json = await res.json();
      setMessages((prev) => [...prev, { role: "assistant", data: json }]);
    } catch (err) {
      setMessages((prev) => [
        ...prev, 
        { 
          role: "assistant", 
          data: { 
            summary: "Error connecting to clinical index server. Please retry.", 
            studies: [] 
          } 
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white font-sans flex flex-col selection:bg-[#00FF66] selection:text-black">
      
      {/* 1. Backdrop Overlay */}
      {sidebarOpen && (
        <div 
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-40 transition-opacity"
        />
      )}

      {/* 2. Slide Drawer (Gemini style) */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-72 bg-zinc-950 border-r border-zinc-900 p-4 flex flex-col justify-between transition-transform duration-300 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-zinc-900">
            <button 
              onClick={() => { setMessages([]); setSidebarOpen(false); }}
              className="flex items-center gap-2 py-2 px-3 rounded-full bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-xs font-semibold text-zinc-200"
            >
              <Plus className="w-4 h-4 text-[#00FF66]" /> New Chat
            </button>
            <button onClick={() => setSidebarOpen(false)} className="p-2 text-zinc-400 hover:text-white">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="space-y-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-500 px-3">Recent Searches</span>
            {messages.filter(m => m.role === "user").map((m, i) => (
              <div key={i} className="text-xs text-zinc-400 truncate px-3 py-2 rounded-xl hover:bg-zinc-900 cursor-pointer">
                {m.content}
              </div>
            ))}
          </div>
        </div>

        <div className="p-3 bg-zinc-900/60 rounded-2xl border border-zinc-900 space-y-2">
          <div className="flex items-center gap-2 text-xs font-bold text-white">
            <Sparkles className="w-4 h-4 text-[#00FF66]" /> Evidex Pro
          </div>
          <p className="text-[11px] text-zinc-400">Unlock meta-analysis graphs & pharma funding bias audits.</p>
          <button className="w-full py-1.5 rounded-xl bg-[#00FF66] text-black text-xs font-extrabold hover:bg-[#00e65c]">
            Upgrade
          </button>
        </div>
      </aside>

      {/* 3. Minimal Gemini Header */}
      <header className="h-14 border-b border-zinc-900/80 px-4 flex items-center justify-between sticky top-0 bg-black/80 backdrop-blur-md z-30">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setSidebarOpen(true)}
            className="p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-900"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2">
            <span className="font-black text-sm tracking-wider text-white">
              Evidex<span className="text-[#00FF66]">.ai</span>
            </span>
            <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-zinc-900 border border-zinc-800 text-[10px] text-zinc-400 font-mono">
              <span className="w-1.5 h-1.5 rounded-full bg-[#00FF66] animate-pulse" />
              PubMed 35M+
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button className="px-3 py-1.5 rounded-full bg-[#00FF66] text-black text-xs font-extrabold shadow-[0_0_12px_rgba(0,255,102,0.3)]">
            Sign In
          </button>
        </div>
      </header>

      {/* 4. Chat Body / Main View */}
      <main className="flex-1 w-full max-w-3xl mx-auto px-4 pb-44 pt-6">
        
        {/* Empty State (Gemini Style) */}
        {messages.length === 0 && (
          <div className="min-h-[70vh] flex flex-col justify-center">
            
            {/* Title Greeting */}
            <div className="space-y-2 mb-10">
              <div className="inline-flex items-center gap-2 text-xs font-bold text-[#00FF66]">
                <Sparkles className="w-4 h-4" />
                <span>Clinical Intelligence Engine</span>
              </div>
              <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-zinc-100">
                Where should we <br />
                <span className="text-[#00FF66]">begin the evidence?</span>
              </h1>
              <p className="text-zinc-400 text-sm max-w-md pt-1">
                Scan PubMed clinical trials, extract sample sizes, and review verified findings without hallucinations.
              </p>
            </div>

            {/* Prompt Suggestion Cards (Gemini 2x2 Grid) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {samplePrompts.map((item, idx) => {
                const Icon = item.icon;
                return (
                  <button
                    key={idx}
                    onClick={() => handleSearch(item.query)}
                    className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800 hover:border-[#00FF66] text-left transition-all group flex flex-col justify-between h-28"
                  >
                    <div className="flex items-center justify-between w-full">
                      <span className="text-xs font-bold text-zinc-200 group-hover:text-white">{item.title}</span>
                      <Icon className="w-4 h-4 text-zinc-500 group-hover:text-[#00FF66] transition-colors" />
                    </div>
                    <p className="text-[11px] text-zinc-400 line-clamp-2 leading-relaxed">{item.desc}</p>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Message Feed */}
        {messages.length > 0 && (
          <div className="space-y-8">
            {messages.map((msg, index) => (
              <div key={index} className="space-y-4">
                
                {/* User Prompt */}
                {msg.role === "user" && (
                  <div className="flex justify-end">
                    <div className="max-w-[85%] bg-zinc-900 border border-zinc-800 text-white rounded-3xl rounded-tr-sm px-5 py-3 text-sm leading-relaxed font-medium">
                      {msg.content}
                    </div>
                  </div>
                )}

                {/* AI Response (Gemini layout) */}
                {msg.role === "assistant" && (
                  <div className="flex gap-3 text-left">
                    <div className="w-7 h-7 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center shrink-0 mt-1">
                      <Sparkles className="w-4 h-4 text-[#00FF66]" />
                    </div>

                    <div className="flex-1 space-y-4">
                      
                      {/* Synthesis Text */}
                      <div className="text-sm text-zinc-200 leading-relaxed whitespace-pre-line bg-zinc-950 border border-zinc-900 p-5 rounded-2xl">
                        <div className="text-xs font-bold uppercase tracking-wider text-[#00FF66] mb-2 flex items-center gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Clinical Synthesis
                        </div>
                        {msg.data?.summary}
                      </div>

                      {/* Locked Monetized Feature */}
                      <div className="relative rounded-2xl border border-zinc-800 bg-zinc-950 p-5 overflow-hidden">
                        <div className="filter blur-sm select-none opacity-30">
                          <h4 className="font-bold text-xs text-white">Pharma Funding Bias & Risk Analysis</h4>
                          <p className="text-[11px] text-zinc-400">Independent vs Industry Sponsored clinical trial audit.</p>
                          <div className="h-10 bg-zinc-900 rounded-lg mt-2" />
                        </div>
                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/70 backdrop-blur-xs">
                          <Lock className="w-5 h-5 text-[#00FF66] mb-1" />
                          <span className="text-xs font-bold text-white">Unlock Deep Meta-Analysis & Bias Audit</span>
                          <button className="mt-2 px-4 py-1 rounded-xl bg-[#00FF66] text-black text-xs font-black hover:bg-[#00e65c] shadow-[0_0_12px_rgba(0,255,102,0.3)]">
                            Upgrade to Pro
                          </button>
                        </div>
                      </div>

                      {/* Source Chips / Accordion */}
                      {msg.data?.studies && msg.data.studies.length > 0 && (
                        <div className="space-y-2 pt-2">
                          <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-500">
                            Sources ({msg.data.studies.length} PubMed Trials)
                          </span>
                          <div className="grid grid-cols-1 gap-2">
                            {msg.data.studies.map((item: any) => (
                              <a
                                key={item.pmid}
                                href={item.url}
                                target="_blank"
                                rel="noreferrer"
                                className="flex items-center justify-between p-3 rounded-xl border border-zinc-900 bg-zinc-950 hover:border-[#00FF66]/60 transition-all group"
                              >
                                <div className="space-y-1 pr-3">
                                  <div className="text-xs font-semibold text-zinc-200 group-hover:text-[#00FF66] transition-colors line-clamp-1">
                                    {item.title}
                                  </div>
                                  <div className="text-[10px] text-zinc-500 font-mono">
                                    {item.source} • PMID: {item.pmid}
                                  </div>
                                </div>
                                <ExternalLink className="w-3.5 h-3.5 text-zinc-500 group-hover:text-[#00FF66] shrink-0" />
                              </a>
                            ))}
                          </div>
                        </div>
                      )}

                    </div>
                  </div>
                )}

              </div>
            ))}

            {/* AI Streaming/Loading State */}
            {loading && (
              <div className="flex gap-3 text-left">
                <div className="w-7 h-7 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center shrink-0 mt-1">
                  <Sparkles className="w-4 h-4 text-[#00FF66] animate-spin" />
                </div>
                <div className="flex items-center gap-2 py-2 text-xs text-zinc-400">
                  <span className="w-2 h-2 rounded-full bg-[#00FF66] animate-ping" />
                  Scanning 35M+ PubMed clinical trials...
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        )}

      </main>

      {/* 5. Fixed Floating Gemini Prompt Bar (Bottom) */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black via-black/90 to-transparent z-30">
        <div className="max-w-3xl mx-auto space-y-2">
          <div className="bg-zinc-950 border-2 border-zinc-800 focus-within:border-[#00FF66] rounded-3xl p-2 px-4 shadow-[0_0_30px_rgba(0,0,0,0.9)] flex items-center gap-2 backdrop-blur-xl">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              placeholder="Ask a clinical question (e.g. SGLT2 vs GLP-1 in CKD)..."
              className="flex-1 bg-transparent text-sm text-white placeholder-zinc-500 focus:outline-none"
            />
            <button
              onClick={() => handleSearch()}
              disabled={loading || !query.trim()}
              className="w-9 h-9 rounded-full bg-[#00FF66] hover:bg-[#00e65c] text-black flex items-center justify-center font-bold transition-all disabled:opacity-30 shrink-0 shadow-[0_0_12px_rgba(0,255,102,0.4)]"
            >
              <ArrowUp className="w-5 h-5" />
            </button>
          </div>

          <p className="text-[10px] text-zinc-600 text-center">
            Evidex can provide insights from PubMed literature. Verify claims with clinical judgment.
          </p>
        </div>
      </div>

    </div>
  );
}
