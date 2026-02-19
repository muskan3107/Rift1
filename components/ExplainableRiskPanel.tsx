"use client";

import { SuspiciousAccount } from "@/lib/types";
import { X, AlertTriangle, TrendingUp, Repeat } from "lucide-react";

interface ExplainableRiskPanelProps {
  account: SuspiciousAccount | null;
  onClose: () => void;
}

export default function ExplainableRiskPanel({
  account,
  onClose,
}: ExplainableRiskPanelProps) {
  if (!account) return null;

  // Parse detected patterns
  const patterns = account.detected_patterns.reduce((acc, pattern) => {
    const [type, count] = pattern.split(":");
    acc[type] = parseInt(count) || 0;
    return acc;
  }, {} as Record<string, number>);

  const cycleCount = patterns["cycle_participation"] || 0;
  const velocityCount = patterns["temporal_velocity"] || 0;

  // Calculate pattern contributions (based on weighted average)
  const cycleContribution = cycleCount > 0 ? 60 : 0; // 60% weight
  const velocityContribution = velocityCount > 0 ? 40 : 0; // 40% weight

  return (
    <div className="fixed right-0 top-0 h-full w-96 bg-slate-900 border-l border-cyan-500/30 shadow-2xl z-50 overflow-y-auto">
      <div className="p-6">
        {/* Header */}
        <div className="flex justify-between items-start mb-6">
          <div>
            <h2 className="text-cyan-400 text-sm font-semibold tracking-wider">
              EXPLAINABLE RISK
            </h2>
            <p className="text-slate-400 text-xs mt-1">Account Analysis</p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Account ID */}
        <div className="mb-6">
          <p className="text-slate-500 text-xs mb-1">ACCOUNT ID</p>
          <p className="text-white font-mono text-lg">{account.account_id}</p>
        </div>

        {/* Suspicion Score */}
        <div className="mb-8">
          <div className="flex items-baseline gap-2 mb-2">
            <span className="text-6xl font-bold text-red-500">
              {Math.round(account.suspicion_score)}%
            </span>
          </div>
          <p className="text-red-400 text-sm font-semibold tracking-wide">
            SUSPICION SCORE
          </p>
        </div>

        {/* Pattern Breakdown */}
        <div className="space-y-4 mb-8">
          <h3 className="text-slate-300 text-sm font-semibold">
            RISK FACTORS
          </h3>

          {/* Cycle Involvement */}
          {cycleCount > 0 && (
            <div className="bg-slate-800/50 rounded-lg p-4 border border-red-500/20">
              <div className="flex items-center gap-2 mb-2">
                <Repeat className="text-red-400" size={16} />
                <span className="text-white text-sm font-medium">
                  {cycleContribution}% Cycle Involvement
                </span>
              </div>
              <p className="text-slate-400 text-xs">
                Participates in {cycleCount} transaction cycle
                {cycleCount > 1 ? "s" : ""}
              </p>
              <div className="mt-2 h-1 bg-slate-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-red-500"
                  style={{ width: `${cycleContribution}%` }}
                />
              </div>
            </div>
          )}

          {/* Temporal Velocity */}
          {velocityCount > 0 && (
            <div className="bg-slate-800/50 rounded-lg p-4 border border-yellow-500/20">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="text-yellow-400" size={16} />
                <span className="text-white text-sm font-medium">
                  {velocityContribution}% Temporal Velocity
                </span>
              </div>
              <p className="text-slate-400 text-xs">
                {velocityCount} rapid pass-through event
                {velocityCount > 1 ? "s" : ""} detected
              </p>
              <div className="mt-2 h-1 bg-slate-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-yellow-500"
                  style={{ width: `${velocityContribution}%` }}
                />
              </div>
            </div>
          )}

          {/* No patterns detected */}
          {account.detected_patterns.length === 0 && (
            <div className="bg-slate-800/50 rounded-lg p-4 border border-green-500/20">
              <div className="flex items-center gap-2">
                <AlertTriangle className="text-green-400" size={16} />
                <span className="text-green-400 text-sm">
                  No suspicious patterns detected
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Ring Membership */}
        {account.ring_id && (
          <div className="bg-cyan-500/10 rounded-lg p-4 border border-cyan-500/30">
            <p className="text-cyan-400 text-xs font-semibold mb-2">
              RING MEMBERSHIP
            </p>
            <p className="text-white font-mono text-lg">{account.ring_id}</p>
            <p className="text-slate-400 text-xs mt-2">
              Part of identified fraud ring
            </p>
          </div>
        )}

        {/* Scoring Method */}
        <div className="mt-8 pt-6 border-t border-slate-700">
          <p className="text-slate-500 text-xs mb-2">SCORING METHOD</p>
          <p className="text-slate-400 text-xs leading-relaxed">
            Suspicion score calculated as weighted average:
            <br />• Cycle participation: 60% weight
            <br />• Temporal velocity: 40% weight
          </p>
        </div>
      </div>
    </div>
  );
}
