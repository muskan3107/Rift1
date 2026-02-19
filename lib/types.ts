// MuleRift Data Contract - TypeScript Interfaces

export interface SuspiciousAccount {
  account_id: string;
  suspicion_score: number;
  detected_patterns: string[];
  ring_id: string | null;
}

export interface FraudRing {
  ring_id: string;
  member_accounts: string[];
  pattern_type: string;
  risk_score: number;
}

export interface AnalysisResult {
  suspicious_accounts: SuspiciousAccount[];
  fraud_rings: FraudRing[];
  summary: {
    total_accounts_analyzed: number;
    suspicious_accounts_flagged: number;
    fraud_rings_detected: number;
    processing_time_seconds: number;
  };
}

// Graph visualization types
export interface GraphNode {
  id: string;
  type: 'account' | 'shared_entity';
  label: string;
  suspicion_score?: number;
  ring_id?: string | null;
}

export interface GraphEdge {
  source: string;
  target: string;
  type: string;
}
