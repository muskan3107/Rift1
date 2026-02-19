"use client";

import { useState } from "react";
import { Search, Download, Power } from "lucide-react";
import { AnalysisResult, SuspiciousAccount } from "@/lib/types";
import Graph3D from "./Graph3D";
import ExplainableRiskPanel from "./ExplainableRiskPanel";
import FraudRingTable3D from "./FraudRingTable3D";
import TimeVelocitySlider from "./TimeVelocitySlider";

interface Dashboard3DProps {
  data: AnalysisResult;
  edges: Array<{
    source: string;
    target: string;
    total_amount: number;
    earliest_timestamp: string;
    latest_timestamp: string;
  }>;
}

export default function Dashboard3D({ data, edges }: Dashboard3DProps) {
  const [selectedAccount, setSelectedAccount] = useState<SuspiciousAccount | null>(null);
  const [selectedRingId, setSelectedRingId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [hideWhitelisted, setHideWhitelisted] = useState(false);
  const [timeVelocityFilter, setTimeVelocityFilter] = useState(72);

  const handleDownloadJSON = () => {
    const dataStr = JSON.stringify(data, null, 2);
    const dataBlob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `mulerift-analysis-${Date.now()}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* Header */}
      <header className="border-b border-cyan-500/20 bg-slate-900/50 backdrop-blur-sm">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">
                <span className="text-cyan-400">MULE RIFT</span>
                <span className="text-slate-400 text-sm ml-3">
                  - REAL-TIME FINANCIAL ANOMALY DETECTION
                </span>
              </h1>
            </div>
            <button
              onClick={handleDownloadJSON}
              className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-cyan-500/30 rounded-lg transition-colors"
            >
              <Download size={16} />
              <span className="text-sm">DOWNLOAD JSON EXPORT</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-6 py-6">
        {/* Top Controls */}
        <div className="flex items-center gap-4 mb-6">
          {/* Search Bar */}
          <div className="flex-1 relative">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              size={18}
            />
            <input
              type="text"
              placeholder="Search Account ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-900 border border-cyan-500/30 rounded-lg pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500/50"
            />
          </div>

          {/* Whitelist Toggle */}
          <label className="flex items-center gap-3 bg-slate-900 border border-cyan-500/30 rounded-lg px-4 py-2.5 cursor-pointer hover:bg-slate-800 transition-colors">
            <div className="relative">
              <input
                type="checkbox"
                checked={hideWhitelisted}
                onChange={(e) => setHideWhitelisted(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cyan-500"></div>
            </div>
            <span className="text-sm text-slate-300">
              Hide Known Business Nodes
            </span>
          </label>
        </div>

        {/* 3D Graph Container */}
        <div className="relative h-[600px] bg-slate-900/50 rounded-lg border border-cyan-500/20 overflow-hidden mb-6">
          <Graph3D
            accounts={data.suspicious_accounts}
            rings={data.fraud_rings}
            edges={edges}
            onNodeClick={setSelectedAccount}
            selectedRingId={selectedRingId}
            searchQuery={searchQuery}
            hideWhitelisted={hideWhitelisted}
            timeVelocityFilter={timeVelocityFilter}
          />

          {/* Ring ID Indicator (when ring is selected) */}
          {selectedRingId && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-cyan-500/20 backdrop-blur-sm border border-cyan-500/50 rounded-lg px-6 py-3">
              <p className="text-cyan-400 text-sm font-semibold">
                RING ID: {selectedRingId} - CIRCULAR ROUTING
              </p>
            </div>
          )}
        </div>

        {/* Time Velocity Slider */}
        <div className="mb-6">
          <TimeVelocitySlider
            value={timeVelocityFilter}
            onChange={setTimeVelocityFilter}
          />
        </div>

        {/* Fraud Ring Table */}
        <FraudRingTable3D
          rings={data.fraud_rings}
          selectedRingId={selectedRingId}
          onRingSelect={setSelectedRingId}
        />
      </div>

      {/* Explainable Risk Panel */}
      {selectedAccount && (
        <ExplainableRiskPanel
          account={selectedAccount}
          onClose={() => setSelectedAccount(null)}
        />
      )}
    </div>
  );
}
