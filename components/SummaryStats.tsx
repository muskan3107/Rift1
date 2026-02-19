"use client";

interface SummaryStatsProps {
  summary: {
    total_accounts_analyzed: number;
    suspicious_accounts_flagged: number;
    fraud_rings_detected: number;
    processing_time_seconds: number;
  };
}

export default function SummaryStats({ summary }: SummaryStatsProps) {
  return (
    <div className="grid grid-cols-4 gap-4 mb-6">
      <div className="bg-white rounded-lg shadow p-6">
        <p className="text-gray-600 text-sm">Total Accounts</p>
        <p className="text-3xl font-bold text-gray-800">{summary.total_accounts}</p>
      </div>
      <div className="bg-white rounded-lg shadow p-6">
        <p className="text-gray-600 text-sm">Suspicious Accounts</p>
        <p className="text-3xl font-bold text-red-600">{summary.suspicious_accounts_flagged}</p>
      </div>
      <div className="bg-white rounded-lg shadow p-6">
        <p className="text-gray-600 text-sm">Rings Detected</p>
        <p className="text-3xl font-bold text-orange-600">{summary.fraud_rings_detected}</p>
      </div>
      <div className="bg-white rounded-lg shadow p-6">
        <p className="text-gray-600 text-sm">Processing Time</p>
        <p className="text-3xl font-bold text-blue-600">{summary.processing_time_seconds.toFixed(3)}s</p>
      </div>
    </div>
  );
}
