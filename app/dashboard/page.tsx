"use client";

import { useEffect, useState } from "react";
import Dashboard3D from "@/components/Dashboard3D";
import { AnalysisResult } from "@/lib/types";
import { generateGraphEdges } from "@/lib/graphUtils";

export default function DashboardPage() {
  const [data, setData] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load sample data
    fetch("/api/sample")
      .then((res) => res.json())
      .then((result) => {
        setData(result);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Failed to load data:", error);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-400 mb-4"></div>
          <p className="text-cyan-400 text-sm">Loading analysis data...</p>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-400 text-lg mb-2">Failed to load data</p>
          <p className="text-slate-400 text-sm">Please try again later</p>
        </div>
      </div>
    );
  }

  const edges = generateGraphEdges(data);

  return <Dashboard3D data={data} edges={edges} />;
}
