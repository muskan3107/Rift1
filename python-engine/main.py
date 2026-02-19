import sys
import json
import time
from graph_builder import build_graph, prune_isolated_nodes
from detectors import detect_all_patterns

def calculate_suspicion_score(patterns):
    """Calculate weighted suspicion score based on detected patterns."""
    score = 0
    pattern_weights = {
        'cycle': 40,
        'velocity': 30,
        'peel': 30
    }
    
    for pattern in patterns:
        if 'cycle' in pattern.lower():
            score += pattern_weights['cycle']
        elif 'velocity' in pattern.lower():
            score += pattern_weights['velocity']
        elif 'peel' in pattern.lower():
            score += pattern_weights['peel']
    
    return min(score, 100)

def main():
    if len(sys.argv) < 2:
        print(json.dumps({"error": "Usage: python main.py <csv_path>"}), file=sys.stderr)
        sys.exit(1)

    csv_path = sys.argv[1]
    start_time = time.time()
    
    # Build graph
    G, df = build_graph(csv_path)
    
    # Prune isolated nodes
    G = prune_isolated_nodes(G)
    
    # Run detection algorithms
    results = detect_all_patterns(G)
    
    # Build suspicious_accounts list
    suspicious_accounts = []
    all_suspicious_nodes = (
        results['cycle_nodes'] | 
        results['velocity_nodes'] | 
        results['peel_nodes']
    )
    
    # Map accounts to rings
    account_to_ring = {}
    ring_counter = 1
    
    for cycle in results['cycle_groups']:
        ring_id = f"RING_{ring_counter:03d}"
        for account in cycle:
            account_to_ring[account] = ring_id
        ring_counter += 1
    
    for peel_chain in results['peel_groups']:
        ring_id = f"RING_{ring_counter:03d}"
        for account in peel_chain:
            if account not in account_to_ring:
                account_to_ring[account] = ring_id
        ring_counter += 1
    
    for account_id in all_suspicious_nodes:
        detected_patterns = []
        
        if account_id in results['cycle_nodes']:
            detected_patterns.append('cycle')
        if account_id in results['velocity_nodes']:
            detected_patterns.append('velocity')
        if account_id in results['peel_nodes']:
            detected_patterns.append('peel')
        
        suspicion_score = calculate_suspicion_score(detected_patterns)
        
        suspicious_accounts.append({
            "account_id": account_id,
            "suspicion_score": suspicion_score,
            "detected_patterns": detected_patterns,
            "ring_id": account_to_ring.get(account_id, None)
        })
    
    # Build fraud_rings list
    fraud_rings = []
    ring_members = {}
    
    for cycle in results['cycle_groups']:
        ring_id = f"RING_{len(fraud_rings) + 1:03d}"
        ring_members[ring_id] = {
            'members': list(cycle),
            'pattern_type': 'cycle'
        }
    
    for peel_chain in results['peel_groups']:
        ring_id = f"RING_{len(fraud_rings) + len(ring_members) + 1:03d}"
        ring_members[ring_id] = {
            'members': list(peel_chain),
            'pattern_type': 'peel'
        }
    
    for ring_id, data in ring_members.items():
        member_scores = [
            acc['suspicion_score'] 
            for acc in suspicious_accounts 
            if acc['account_id'] in data['members']
        ]
        risk_score = sum(member_scores) / len(member_scores) if member_scores else 0
        
        fraud_rings.append({
            "ring_id": ring_id,
            "member_accounts": data['members'],
            "pattern_type": data['pattern_type'],
            "risk_score": round(risk_score, 2)
        })
    
    processing_time = time.time() - start_time
    
    # Build final output matching MuleRift contract
    output = {
        "suspicious_accounts": suspicious_accounts,
        "fraud_rings": fraud_rings,
        "summary": {
            "total_accounts_analyzed": G.number_of_nodes(),
            "suspicious_accounts_flagged": len(suspicious_accounts),
            "fraud_rings_detected": len(fraud_rings),
            "processing_time_seconds": round(processing_time, 3)
        }
    }
    
    print(json.dumps(output, indent=2))

if __name__ == "__main__":
    main()
