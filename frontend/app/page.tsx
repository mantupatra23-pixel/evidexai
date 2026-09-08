"use client";

import { useState } from "react";
import { Search, ArrowRight, ExternalLink, ShieldAlert, CheckCircle2, Lock } from "lucide-react";

export default function Home() {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<any>(null);

  const handleSearch = async () => {
    if (!query.trim()) return;
    setLoading(true);
    setData(null);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "https://evidexai-backend.onrender.com";
      const res = await fetch(`${apiUrl}/api/search?q=${encodeURIComponent(query)}`);
      const json = await res.json();
      setData(json);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-zinc-100 flex flex-col items-center px-4 py-12 relative font-sans">
      <div className="w-full max-w-4xl flex flex-col items-center text-center">
        {/* Brand Tag */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-zinc-800 bg-zinc-950 text-xs font-medium text-zinc-400 mb-6">
          <span className="w-2 h-2 rounded-full bg-[#00FF66] animate-pulse" />
          PubMed Clinical Indexer
        </div>

        <h1 className="text-4xl sm:text-6xl font-black tracking-tight mb-3">
          Evidence starts <span className="text-[#00FF66]">here.</span>
        </h1>
        <p className="text-zinc-400 text-sm sm:text-base max-w-md mb-8">
          Search peer-reviewed medical trials and extract verified clinical conclusions.
        </p>

        {/* Search Input Box */}
        <div className="w-full bg-zinc-950 border border-zinc-800 focus-within:border-[#00FF66] rounded-2xl p-2.5 transition-all shadow-2xl">
          <div className="flex items-center px-3">
            <Search className="w-5 h-5 text-zinc-500 mr-3" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              placeholder="Enter clinical question (e.g. Metformin in CKD stage 3)..."
              className="w-full bg-transparent text-sm sm:text-base text-zinc-100 placeholder-zinc-500 focus:outline-none"
            />
            <button
              onClick={handleSearch}
              disabled={loading || !query.trim()}
              className="p-2.5 rounded-xl bg-[#00FF66] text-black font-semibold hover:bg-[#00e65c] transition-all disabled:opacity-40"
            >
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Loading Indicator */}
        {loading && (
          <div className="mt-12 text-sm text-zinc-400 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#00FF66] animate-ping" />
            Scanning 35M+ PubMed trials...
          </div>
        )}

        {/* Search Results Display */}
        {data && (
          <div className="w-full mt-10 space-y-6 text-left">
            {/* AI Summary Box */}
            <div className="p-6 rounded-2xl bg-zinc-950 border border-zinc-800">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-[#00FF66] mb-3 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" /> Clinical Synthesis
              </h3>
              <p className="text-sm text-zinc-300 leading-relaxed whitespace-pre-line">{data.summary}</p>
            </div>

            {/* Blurred Premium Analytics Feature */}
            <div className="relative rounded-2xl border border-zinc-800 bg-zinc-950 p-6 overflow-hidden">
              <div className="filter blur-sm select-none opacity-40">
                <h4 className="font-bold mb-2">Pharma Funding Bias & Risk Analysis</h4>
                <p className="text-xs text-zinc-400">Conflict of interest audit: 2 studies funded by pharmaceutical sponsors.</p>
                <div className="h-16 bg-zinc-900 rounded-lg mt-3" />
              </div>
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 backdrop-blur-xs">
                <Lock className="w-6 h-6 text-[#00FF66] mb-2" />
                <span className="text-sm font-semibold text-zinc-200">Unlock Full Meta-Analysis & Bias Audit</span>
                <button className="mt-3 px-4 py-1.5 rounded-xl bg-[#00FF66] text-black text-xs font-bold hover:bg-[#00e65c]">
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
                  className="block p-4 rounded-xl border border-zinc-800/80 bg-zinc-950 hover:border-zinc-700 transition-all"
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
      </div>
    </div>
  );
}
