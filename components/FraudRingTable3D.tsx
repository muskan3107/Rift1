"use client";

import { FraudRing } from "@/lib/types";
import { Circle } from "lucide-react";

interface FraudRingTable3DProps {
  rings: FraudRing[];
  selectedRingId: string | null;
  onRingSelect: (ringId: string | null) => void;
}

export default function FraudRingTable3D({
  rings,
  selectedRingId,
  onRingSelect,
}: FraudRingTable3DProps) {
  const getPatternColor = (pattern: string) => {
    switch (pattern) {
      case "cycle":
        return "text-red-400";
      case "smurfing":
        return "text-yellow-400";
      case "shell":
        return "text-purple-400";
      default:
        return "text-slate-400";
    }
  };

  const getRiskColor = (score: number) => {
    if (score > 70) return "text-red-500";
    if (score > 50) return "text-yellow-500";
    return "text-green-500";
  };

  return (
    <div className="bg-slate-900/80 backdrop-blur-sm rounded-lg border border-cyan-500/20 overflow-hidden">
      <div className="px-4 py-3 border-b border-slate-700">
        <h3 className="text-cyan-400 text-sm font-semibold tracking-wider">
          FRAUD RING TABLE
        </h3>
        <p className="text-slate-500 text-xs mt-1">
          Click to isolate ring in 3D view
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-700 bg-slate-800/50">
              <th className="text-left px-4 py-3 text-slate-400 font-medium text-xs">
                Account ID
              </th>
              <th className="text-left px-4 py-3 text-slate-400 font-medium text-xs">
                Suspicion Score
              </th>
              <th className="text-left px-4 py-3 text-slate-400 font-medium text-xs">
                Pattern Type
              </th>
              <th className="text-left px-4 py-3 text-slate-400 font-medium text-xs">
                Ring
              </th>
              <th className="text-left px-4 py-3 text-slate-400 font-medium text-xs">
                Ring ID
              </th>
            </tr>
          </thead>
          <tbody>
            {rings.map((ring) => {
              const isSelected = selectedRingId === ring.ring_id;
              return (
                <tr
                  key={ring.ring_id}
                  onClick={() =>
                    onRingSelect(isSelected ? null : ring.ring_id)
                  }
                  className={`
                    border-b border-slate-800 cursor-pointer transition-all
                    ${
                      isSelected
                        ? "bg-cyan-500/20 border-cyan-500/50"
                        : "hover:bg-slate-800/50"
                    }
                  `}
                >
                  <td className="px-4 py-3">
                    <div className="flex flex-col gap-1">
                      {ring.member_accounts.slice(0, 2).map((acc) => (
                        <span key={acc} className="text-cyan-300 font-mono text-xs">
                          {acc}
                        </span>
                      ))}
                      {ring.member_accounts.length > 2 && (
                        <span className="text-slate-500 text-xs">
                          +{ring.member_accounts.length - 2} more
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-1.5 bg-slate-700 rounded-full overflow-hidden">
                        <div
                          className={`h-full ${
                            ring.risk_score > 70
                              ? "bg-red-500"
                              : ring.risk_score > 50
                              ? "bg-yellow-500"
                              : "bg-green-500"
                          }`}
                          style={{ width: `${ring.risk_score}%` }}
                        />
                      </div>
                      <span className={`font-mono text-xs ${getRiskColor(ring.risk_score)}`}>
                        {ring.risk_score.toFixed(0)}%
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`text-xs font-medium uppercase ${getPatternColor(
                        ring.pattern_type
                      )}`}
                    >
                      {ring.pattern_type}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-slate-400 text-xs">
                      {ring.risk_score.toFixed(0)}%
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      {isSelected && (
                        <Circle className="text-cyan-400 fill-cyan-400" size={8} />
                      )}
                      <span
                        className={`font-mono text-xs ${
                          isSelected ? "text-cyan-400" : "text-red-400"
                        }`}
                      >
                        {ring.ring_id}
                      </span>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {rings.length === 0 && (
        <div className="px-4 py-8 text-center text-slate-500 text-sm">
          No fraud rings detected
        </div>
      )}
    </div>
  );
}
