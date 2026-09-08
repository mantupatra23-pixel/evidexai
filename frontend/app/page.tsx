"use client";

import { useState, useRef, useEffect } from "react";
import { 
  Sparkles, ArrowUp, Menu, X, Plus, ExternalLink, 
  Lock, CheckCircle2, ShieldAlert, FileText, Scale, 
  Database, BookOpen
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
      title: "Pharma Bias Audit",
      desc: "Intermittent fasting vs calorie restriction trials",
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
    <div className="min-h-screen bg-[#152935] text-[#fde5d6] font-sans flex flex-col justify-between selection:bg-[#e4a576] selection:text-[#152935]">
      
      {/* 1. Backdrop Overlay */}
      {sidebarOpen && (
        <div 
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 bg-[#0f1d26]/80 backdrop-blur-sm z-40 transition-opacity"
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

          <button 
            onClick={() => { setMessages([]); setSidebarOpen(false); }}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-[#152935] hover:bg-[#1c3646] border border-[#698ea2]/40 text-xs font-bold text-[#fde5d6] transition-all shadow-md"
          >
            <Plus className="w-4 h-4 text-[#e4a576]" /> New Chat
          </button>

          <div className="space-y-1.5">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#698ea2] px-2">History</span>
            {messages.filter(m => m.role === "user").map((m, i) => (
              <div key={i} className="text-xs text-[#ccd5d2] truncate px-3 py-2 rounded-xl hover:bg-[#152935] cursor-pointer">
                {m.content}
              </div>
            ))}
          </div>
        </div>

        <div className="p-4 bg-[#152935] rounded-2xl border border-[#698ea2]/30 space-y-2">
          <div className="flex items-center gap-2 text-xs font-bold text-[#fde5d6]">
            <Sparkles className="w-4 h-4 text-[#e4a576]" /> Evidex Pro
          </div>
          <p className="text-[11px] text-[#ccd5d2] leading-relaxed">Unlock complete meta-analysis graphs and pharma conflict audits.</p>
          <button className="w-full py-2 rounded-xl bg-[#e4a576] text-[#152935] text-xs font-black hover:bg-[#d89766] transition-all">
            Upgrade
          </button>
        </div>
      </aside>

      {/* 3. Top Header Bar */}
      <header className="h-14 border-b border-[#698ea2]/20 px-4 flex items-center justify-between sticky top-0 bg-[#152935]/90 backdrop-blur-md z-30">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setSidebarOpen(true)}
            className="p-2 rounded-xl text-[#ccd5d2] hover:text-white hover:bg-[#1f3b4c]"
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

        <button className="px-4 py-1.5 rounded-full bg-[#e4a576] text-[#152935] text-xs font-bold hover:bg-[#d89766] transition-all shadow-[0_0_12px_rgba(228,165,118,0.3)]">
          Sign In
        </button>
      </header>

      {/* 4. Chat & Evidence Display (Scrollable) */}
      <main className="flex-1 w-full max-w-3xl mx-auto px-4 pb-40 pt-4 flex flex-col justify-end">
        
        {/* Empty State (Gemini Style: Content Centered Towards Bottom) */}
        {messages.length === 0 && (
          <div className="space-y-6 pb-6 mt-auto">
            
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 text-xs font-bold text-[#e4a576]">
                <Sparkles className="w-4 h-4" />
                <span>Clinical Intelligence Engine</span>
              </div>
              <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-[#fde5d6]">
                Evidence starts <span className="text-[#e4a576]">here.</span>
              </h1>
              <p className="text-[#ccd5d2] text-sm max-w-lg leading-relaxed">
                Scan peer-reviewed clinical trials, extract sample sizes, and verify consensus without hallucination.
              </p>
            </div>

            {/* 2x2 Suggestion Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {samplePrompts.map((item, idx) => {
                const Icon = item.icon;
                return (
                  <button
                    key={idx}
                    onClick={() => handleSearch(item.query)}
                    className="p-4 rounded-2xl bg-[#0f1e27]/80 border border-[#698ea2]/30 hover:border-[#e4a576] text-left transition-all group flex flex-col justify-between h-24 hover:bg-[#122430]"
                  >
                    <div className="flex items-center justify-between w-full">
                      <span className="text-xs font-bold text-[#fde5d6] group-hover:text-[#e4a576] transition-colors">{item.title}</span>
                      <Icon className="w-4 h-4 text-[#698ea2] group-hover:text-[#e4a576] transition-colors" />
                    </div>
                    <p className="text-[11px] text-[#ccd5d2] line-clamp-1 leading-relaxed">{item.desc}</p>
                  </button>
                );
              })}
            </div>

          </div>
        )}

        {/* Conversation Feed */}
        {messages.length > 0 && (
          <div className="space-y-6">
            {messages.map((msg, index) => (
              <div key={index} className="space-y-4">
                
                {/* User Message */}
                {msg.role === "user" && (
                  <div className="flex justify-end">
                    <div className="max-w-[85%] bg-[#1c3646] border border-[#698ea2]/40 text-[#fde5d6] rounded-3xl rounded-tr-sm px-5 py-3 text-sm font-medium leading-relaxed shadow-md">
                      {msg.content}
                    </div>
                  </div>
                )}

                {/* Assistant Message */}
                {msg.role === "assistant" && (
                  <div className="flex gap-3 text-left">
                    <div className="w-8 h-8 rounded-full bg-[#0f1e27] border border-[#698ea2]/40 flex items-center justify-center shrink-0 mt-1">
                      <Sparkles className="w-4 h-4 text-[#e4a576]" />
                    </div>

                    <div className="flex-1 space-y-4">
                      
                      {/* Clinical Synthesis Card */}
                      <div className="text-sm text-[#fde5d6] leading-relaxed whitespace-pre-line bg-[#0f1e27] border border-[#698ea2]/30 p-5 rounded-2xl shadow-lg">
                        <div className="text-xs font-bold uppercase tracking-wider text-[#e4a576] mb-2 flex items-center gap-1.5">
                          <CheckCircle2 className="w-4 h-4" /> Clinical Synthesis
                        </div>
                        {msg.data?.summary}
                      </div>

                      {/* Locked Feature */}
                      <div className="relative rounded-2xl border border-[#698ea2]/30 bg-[#0f1e27] p-5 overflow-hidden">
                        <div className="filter blur-sm select-none opacity-25">
                          <h4 className="font-bold text-xs text-[#fde5d6]">Pharma Funding Bias & Risk Analysis</h4>
                          <p className="text-[11px] text-[#ccd5d2]">Independent vs Industry Sponsored clinical trial audit.</p>
                          <div className="h-10 bg-[#152935] rounded-lg mt-2" />
                        </div>
                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#0f1e27]/80 backdrop-blur-xs">
                          <Lock className="w-5 h-5 text-[#e4a576] mb-1" />
                          <span className="text-xs font-bold text-[#fde5d6]">Unlock Meta-Analysis & Bias Audit</span>
                          <button className="mt-2.5 px-4 py-1.5 rounded-xl bg-[#e4a576] text-[#152935] text-xs font-black hover:bg-[#d89766] transition-all shadow-md">
                            Upgrade to Pro
                          </button>
                        </div>
                      </div>

                      {/* Referenced Studies */}
                      {msg.data?.studies && msg.data.studies.length > 0 && (
                        <div className="space-y-2 pt-2">
                          <span className="text-[11px] font-bold uppercase tracking-wider text-[#698ea2]">
                            Sources ({msg.data.studies.length} PubMed Studies)
                          </span>
                          <div className="grid grid-cols-1 gap-2">
                            {msg.data.studies.map((item: any) => (
                              <a
                                key={item.pmid}
                                href={item.url}
                                target="_blank"
                                rel="noreferrer"
                                className="flex items-center justify-between p-3.5 rounded-xl border border-[#698ea2]/20 bg-[#0f1e27] hover:border-[#e4a576] transition-all group"
                              >
                                <div className="space-y-1 pr-3">
                                  <div className="text-xs font-semibold text-[#fde5d6] group-hover:text-[#e4a576] transition-colors line-clamp-1">
                                    {item.title}
                                  </div>
                                  <div className="text-[10px] text-[#ccd5d2]">
                                    {item.source} • PMID: {item.pmid}
                                  </div>
                                </div>
                                <ExternalLink className="w-3.5 h-3.5 text-[#698ea2] group-hover:text-[#e4a576] shrink-0" />
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

            {loading && (
              <div className="flex gap-3 text-left">
                <div className="w-8 h-8 rounded-full bg-[#0f1e27] border border-[#698ea2]/40 flex items-center justify-center shrink-0 mt-1">
                  <Sparkles className="w-4 h-4 text-[#e4a576] animate-spin" />
                </div>
                <div className="flex items-center gap-2 py-2 text-xs text-[#ccd5d2]">
                  <span className="w-2 h-2 rounded-full bg-[#e4a576] animate-ping" />
                  Scanning 35M+ PubMed clinical trials...
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        )}

      </main>

      {/* 5. Fixed Bottom Prompt Bar (Gemini Capsule) */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-[#152935] via-[#152935]/95 to-transparent z-30">
        <div className="max-w-3xl mx-auto space-y-2">
          <div className="bg-[#0f1e27] border border-[#698ea2]/40 focus-within:border-[#e4a576] rounded-3xl p-2 px-4 shadow-2xl flex items-center gap-2 backdrop-blur-xl">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              placeholder="Ask a clinical question (e.g. SGLT2 vs GLP-1 in CKD)..."
              className="flex-1 bg-transparent text-sm text-[#fde5d6] placeholder-[#698ea2] focus:outline-none"
            />
            <button
              onClick={() => handleSearch()}
              disabled={loading || !query.trim()}
              className="w-9 h-9 rounded-full bg-[#e4a576] hover:bg-[#d89766] text-[#152935] flex items-center justify-center font-bold transition-all disabled:opacity-30 shrink-0 shadow-[0_0_12px_rgba(228,165,118,0.3)]"
            >
              <ArrowUp className="w-5 h-5" />
            </button>
          </div>

          <p className="text-[10px] text-[#ccd5d2]/70 text-center">
            Evidex references 35M+ PubMed trials. Always verify evidence with clinical judgment.
          </p>
        </div>
      </div>

    </div>
  );
}
