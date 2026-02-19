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
        'smurfing': 30,
        'shell': 30,
        'velocity': 30
    }
    
    for pattern in patterns:
        pattern_lower = pattern.lower()
        if 'cycle' in pattern_lower:
            score += pattern_weights['cycle']
        elif 'fan_in' in pattern_lower or 'fan_out' in pattern_lower:
            score += pattern_weights['smurfing']
        elif 'shell' in pattern_lower:
            score += pattern_weights['shell']
        elif 'velocity' in pattern_lower:
            score += pattern_weights['velocity']
    
    return min(score, 100)

def main():
    """MuleRift - Graph-based money muling detection engine.
    
    Analyzes transaction CSV to detect:
    - Circular Fund Routing (Cycles)
    - Smurfing Patterns (Fan-in / Fan-out)
    - Layered Shell Networks
    """
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
        results['smurfing_nodes'] | 
        results['shell_nodes'] |
        results['velocity_nodes']
    )
    
    # Map accounts to rings
    account_to_ring = {}
    ring_counter = 1
    
    for cycle in results['cycle_groups']:
        ring_id = f"RING_{ring_counter:03d}"
        for account in cycle:
            account_to_ring[account] = ring_id
        ring_counter += 1
    
    for smurfing_group in results['smurfing_groups']:
        ring_id = f"RING_{ring_counter:03d}"
        for account in smurfing_group:
            if account not in account_to_ring:
                account_to_ring[account] = ring_id
        ring_counter += 1
    
    for shell_chain in results['shell_groups']:
        ring_id = f"RING_{ring_counter:03d}"
        for account in shell_chain:
            if account not in account_to_ring:
                account_to_ring[account] = ring_id
        ring_counter += 1
    
    for account_id in all_suspicious_nodes:
        detected_patterns = []
        
        # Add descriptive pattern names
        if account_id in results['cycle_nodes']:
            pattern_name = results['cycle_metadata'].get(account_id, 'cycle')
            detected_patterns.append(pattern_name)
        
        if account_id in results['smurfing_nodes']:
            pattern_name = results['smurfing_metadata'].get(account_id, 'smurfing')
            detected_patterns.append(pattern_name)
        
        if account_id in results['shell_nodes']:
            pattern_name = results['shell_metadata'].get(account_id, 'shell')
            detected_patterns.append(pattern_name)
        
        if account_id in results['velocity_nodes']:
            pattern_name = results['velocity_metadata'].get(account_id, 'high_velocity')
            detected_patterns.append(pattern_name)
        
        suspicion_score = calculate_suspicion_score(detected_patterns)
        
        # Only include accounts with score > 50
        if suspicion_score > 50:
            suspicious_accounts.append({
                "account_id": account_id,
                "suspicion_score": round(suspicion_score, 1),
                "detected_patterns": detected_patterns,
                "ring_id": account_to_ring.get(account_id, "")
            })
    
    # Sort by suspicion_score descending
    suspicious_accounts.sort(key=lambda x: x['suspicion_score'], reverse=True)
    
    # Build fraud_rings list
    fraud_rings = []
    ring_data = {}
    
    # Process cycle groups
    for cycle in results['cycle_groups']:
        ring_id = f"RING_{len(fraud_rings) + 1:03d}"
        ring_data[ring_id] = {
            'members': sorted(list(set(cycle))),
            'pattern_type': 'cycle'
        }
        fraud_rings.append(ring_id)
    
    # Process smurfing groups
    for smurfing_group in results['smurfing_groups']:
        ring_id = f"RING_{len(fraud_rings) + 1:03d}"
        ring_data[ring_id] = {
            'members': sorted(list(set(smurfing_group))),
            'pattern_type': 'smurfing'
        }
        fraud_rings.append(ring_id)
    
    # Process shell groups
    for shell_chain in results['shell_groups']:
        ring_id = f"RING_{len(fraud_rings) + 1:03d}"
        ring_data[ring_id] = {
            'members': sorted(list(set(shell_chain))),
            'pattern_type': 'shell'
        }
        fraud_rings.append(ring_id)
    
    # Build final fraud_rings output
    fraud_rings_output = []
    for ring_id in fraud_rings:
        data = ring_data[ring_id]
        
        # Calculate risk score from all members (not just suspicious ones)
        member_scores = []
        for account_id in data['members']:
            detected_patterns = []
            
            if account_id in results['cycle_nodes']:
                pattern_name = results['cycle_metadata'].get(account_id, 'cycle')
                detected_patterns.append(pattern_name)
            
            if account_id in results['smurfing_nodes']:
                pattern_name = results['smurfing_metadata'].get(account_id, 'smurfing')
                detected_patterns.append(pattern_name)
            
            if account_id in results['shell_nodes']:
                pattern_name = results['shell_metadata'].get(account_id, 'shell')
                detected_patterns.append(pattern_name)
            
            if account_id in results['velocity_nodes']:
                pattern_name = results['velocity_metadata'].get(account_id, 'high_velocity')
                detected_patterns.append(pattern_name)
            
            score = calculate_suspicion_score(detected_patterns)
            member_scores.append(score)
        
        risk_score = sum(member_scores) / len(member_scores) if member_scores else 0
        
        fraud_rings_output.append({
            "ring_id": ring_id,
            "member_accounts": data['members'],
            "pattern_type": data['pattern_type'],
            "risk_score": round(risk_score, 1)
        })
    
    # Sort by ring_id ascending
    fraud_rings_output.sort(key=lambda x: x['ring_id'])
    
    processing_time = time.time() - start_time
    
    # Build final output matching MuleRift contract
    output = {
        "suspicious_accounts": suspicious_accounts,
        "fraud_rings": fraud_rings_output,
        "summary": {
            "total_accounts_analyzed": G.number_of_nodes(),
            "suspicious_accounts_flagged": len(suspicious_accounts),
            "fraud_rings_detected": len(fraud_rings_output),
            "processing_time_seconds": round(processing_time, 1)
        }
    }
    
    print(json.dumps(output, indent=2))

if __name__ == "__main__":
    main()
