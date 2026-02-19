"use client";

import { FraudRing } from "@/lib/types";

interface FraudRingTableProps {
  rings: FraudRing[];
}

export default function FraudRingTable({ rings }: FraudRingTableProps) {
  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h2 className="text-2xl font-bold mb-4">Detected Fraud Rings</h2>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b">
              <th className="text-left p-3">Ring ID</th>
              <th className="text-left p-3">Pattern</th>
              <th className="text-left p-3">Members</th>
              <th className="text-left p-3">Risk Score</th>
            </tr>
          </thead>
          <tbody>
            {rings.map((ring) => (
              <tr key={ring.ring_id} className="border-b hover:bg-gray-50">
                <td className="p-3 font-mono">{ring.ring_id}</td>
                <td className="p-3">{ring.pattern_type}</td>
                <td className="p-3">{ring.member_accounts.join(", ")}</td>
                <td className="p-3">
                  <span className={`font-semibold ${ring.risk_score > 70 ? "text-red-600" : "text-yellow-600"}`}>
                    {ring.risk_score.toFixed(1)}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
