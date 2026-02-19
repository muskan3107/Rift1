"use client";

import { SuspiciousAccount } from "@/lib/types";

interface AccountModalProps {
  account: SuspiciousAccount;
  onClose: () => void;
}

export default function AccountModal({ account, onClose }: AccountModalProps) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold">Account Details</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 text-2xl">
            ×
          </button>
        </div>
        <div className="space-y-3">
          <div>
            <p className="text-sm text-gray-600">Account ID</p>
            <p className="font-mono font-semibold">{account.account_id}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Suspicion Score</p>
            <p className={`text-2xl font-bold ${account.suspicion_score > 50 ? "text-red-600" : "text-green-600"}`}>
              {account.suspicion_score}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Ring ID</p>
            <p className="font-mono">{account.ring_id || "None"}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Patterns Detected</p>
            <ul className="list-disc list-inside">
              {account.detected_patterns.map((pattern, idx) => (
                <li key={idx} className="text-sm">{pattern}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
