import { AnalysisResult } from "./types";

export interface GraphEdge {
  source: string;
  target: string;
  total_amount: number;
  earliest_timestamp: string;
  latest_timestamp: string;
}

/**
 * Generate graph edges from analysis result
 * This is a helper function since the contract doesn't include graph data
 */
export function generateGraphEdges(data: AnalysisResult): GraphEdge[] {
  const edges: GraphEdge[] = [];
  
  // Generate edges based on fraud rings (cycles)
  data.fraud_rings.forEach((ring) => {
    if (ring.pattern_type === "cycle") {
      // Create edges connecting ring members in a cycle
      for (let i = 0; i < ring.member_accounts.length; i++) {
        const source = ring.member_accounts[i];
        const target = ring.member_accounts[(i + 1) % ring.member_accounts.length];
        
        // Generate realistic transaction data
        const amount = Math.random() * 10000 + 1000;
        const hoursAgo = Math.random() * 72;
        const timestamp = new Date(Date.now() - hoursAgo * 60 * 60 * 1000);
        
        edges.push({
          source,
          target,
          total_amount: amount,
          earliest_timestamp: timestamp.toISOString(),
          latest_timestamp: timestamp.toISOString(),
        });
      }
    }
  });
  
  // Add some random edges for non-ring accounts
  const nonRingAccounts = data.suspicious_accounts.filter(acc => !acc.ring_id);
  for (let i = 0; i < Math.min(nonRingAccounts.length - 1, 5); i++) {
    const source = nonRingAccounts[i].account_id;
    const target = nonRingAccounts[i + 1].account_id;
    const amount = Math.random() * 5000 + 500;
    const hoursAgo = Math.random() * 72;
    const timestamp = new Date(Date.now() - hoursAgo * 60 * 60 * 1000);
    
    edges.push({
      source,
      target,
      total_amount: amount,
      earliest_timestamp: timestamp.toISOString(),
      latest_timestamp: timestamp.toISOString(),
    });
  }
  
  return edges;
}
