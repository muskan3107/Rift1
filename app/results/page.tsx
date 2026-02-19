"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AnalysisResult } from "@/lib/types";
import SummaryStats from "@/components/SummaryStats";
import FraudRingTable from "@/components/FraudRingTable";
import AccountModal from "@/components/AccountModal";
import ChatInterface from "@/components/ChatInterface";

export default function ResultsPage() {
  const router = useRouter();
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [selectedAccount, setSelectedAccount] = useState<string | null>(null);
  const [showChat, setShowChat] = useState(false);

  useEffect(() => {
    const data = sessionStorage.getItem("analysisResult");
    if (!data) {
      router.push("/");
      return;
    }
    setResult(JSON.parse(data));
  }, [router]);

  if (!result) return <div className="p-8">Loading...</div>;

  const handleDownload = async () => {
    const response = await fetch("/api/download", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(result),
    });
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `fraud-analysis-${Date.now()}.json`;
    a.click();
  };

  return (
    <main className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800">Analysis Results</h1>
          <div className="space-x-4">
            <button
              onClick={() => setShowChat(!showChat)}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
            >
              {showChat ? "Hide" : "Show"} AI Assistant
            </button>
            <button
              onClick={handleDownload}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              Download JSON
            </button>
            <button
              onClick={() => router.push("/")}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
            >
              New Analysis
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className={showChat ? "lg:col-span-2" : "lg:col-span-3"}>
            <SummaryStats summary={result.summary} />
            <FraudRingTable rings={result.fraud_rings} />
          </div>

          {showChat && (
            <div className="lg:col-span-1">
              <div className="sticky top-8 h-[calc(100vh-8rem)]">
                <ChatInterface analysisContext={result} />
              </div>
            </div>
          )}
        </div>

        {selectedAccount && (
          <AccountModal
            account={result.suspicious_accounts.find((a) => a.account_id === selectedAccount)!}
            onClose={() => setSelectedAccount(null)}
          />
        )}
      </div>
    </main>
  );
}
