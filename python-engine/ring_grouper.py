"""
Ring grouper module for identifying fraud rings based on structural patterns.

This module implements structural ring intelligence with overlapping cycle merging.
When accounts belong to multiple cycles, those cycles are merged into a single ring
with elevated risk scores.
"""

import networkx as nx


def _merge_overlapping_cycles(cycle_groups):
    """
    Merge overlapping cycles into unified rings.
    
    Logic:
    1. Create a graph where each node is a cycle
    2. Add edges between cycles that share common accounts
    3. Find connected components to group overlapping cycles
    4. Merge cycles in each component into a single ring
    
    Args:
        cycle_groups: list of lists (detected cycles)
        
    Returns:
        tuple: (merged_groups, account_cycle_count)
            - merged_groups: list of merged cycle groups
            - account_cycle_count: dict mapping account_id to number of cycles it belongs to
    """
    if not cycle_groups:
        return [], {}
    
    # Track how many cycles each account belongs to
    account_cycle_count = {}
    for cycle in cycle_groups:
        for account in cycle:
            account_cycle_count[account] = account_cycle_count.get(account, 0) + 1
    
    # Create cycle graph where nodes are cycle indices
    cycle_graph = nx.Graph()
    for i in range(len(cycle_groups)):
        cycle_graph.add_node(i)
    
    # Add edges between cycles that share accounts
    for i in range(len(cycle_groups)):
        for j in range(i + 1, len(cycle_groups)):
            cycle_i = set(cycle_groups[i])
            cycle_j = set(cycle_groups[j])
            
            # If cycles share any account, connect them
            if cycle_i & cycle_j:
                cycle_graph.add_edge(i, j)
    
    # Find connected components (groups of overlapping cycles)
    merged_groups = []
    for component in nx.connected_components(cycle_graph):
        # Merge all cycles in this component
        merged_accounts = set()
        for cycle_idx in component:
            merged_accounts.update(cycle_groups[cycle_idx])
        
        merged_groups.append(sorted(list(merged_accounts)))
    
    return merged_groups, account_cycle_count


def _combine_structural_groups(analysis_results):
    """
    Combine cycle, smurfing, and shell groups with cycle merging.
    
    Args:
        analysis_results: dict with keys:
            - cycle_groups: list of lists (cycle patterns)
            - smurfing_groups: list of lists (smurfing patterns)
            - shell_groups: list of lists (shell network patterns)
            
    Returns:
        tuple: (candidate_groups, pattern_types, account_cycle_count)
    """
    candidate_groups = []
    pattern_types = []
    
    # Merge overlapping cycles first
    cycle_groups = analysis_results.get('cycle_groups', [])
    merged_cycles, account_cycle_count = _merge_overlapping_cycles(cycle_groups)
    
    # Sort members alphabetically within each merged cycle
    for group in merged_cycles:
        candidate_groups.append(sorted(group))
        pattern_types.append('cycle')
    
    # Add smurfing groups with sorted members
    smurfing_groups = analysis_results.get('smurfing_groups', [])
    for group in smurfing_groups:
        candidate_groups.append(sorted(list(set(group))))
        pattern_types.append('smurfing')
    
    # Add shell groups with sorted members
    shell_groups = analysis_results.get('shell_groups', [])
    for group in shell_groups:
        candidate_groups.append(sorted(list(set(group))))
        pattern_types.append('shell')
    
    return candidate_groups, pattern_types, account_cycle_count


def _sort_rings_deterministically(candidate_groups, pattern_types):
    """
    Sort rings deterministically by first account_id in each ring.
    
    This ensures deterministic ring ID assignment across multiple runs.
    
    Args:
        candidate_groups: list of lists (account groups with sorted members)
        pattern_types: list of pattern type strings
        
    Returns:
        tuple: (sorted_groups, sorted_pattern_types)
    """
    # Combine groups with their pattern types for sorting
    combined = list(zip(candidate_groups, pattern_types))
    
    # Sort by the first account_id in each group
    combined.sort(key=lambda x: x[0][0] if x[0] else '')
    
    # Unzip back into separate lists
    sorted_groups = [group for group, _ in combined]
    sorted_pattern_types = [pattern for _, pattern in combined]
    
    return sorted_groups, sorted_pattern_types


def _calculate_ring_risk_score(member_accounts, scores_dict, account_cycle_count):
    """
    Calculate risk score with bonus for accounts in multiple cycles.
    
    Logic:
    - Base score: average of all member scores
    - Bonus: +25 points for each account that belongs to multiple cycles
    - Cap at 100
    
    Args:
        member_accounts: list of account IDs in the ring
        scores_dict: dict mapping account_id to {'score': float, 'patterns': list}
        account_cycle_count: dict mapping account_id to number of cycles
        
    Returns:
        float: Risk score rounded to 1 decimal
    """
    total_score = 0
    bonus_points = 0
    
    for account in member_accounts:
        # Add base score
        if account in scores_dict:
            total_score += scores_dict[account]['score']
        
        # Add bonus for multi-cycle membership
        cycle_count = account_cycle_count.get(account, 0)
        if cycle_count > 1:
            bonus_points += 25
    
    base_avg = total_score / len(member_accounts) if member_accounts else 0
    final_score = min(base_avg + bonus_points, 100)
    
    return round(final_score, 1)


def group_rings(graph, scores_dict, analysis_results):
    """
    Group accounts into fraud rings with deterministic ring ID assignment.
    
    This function implements advanced structural ring intelligence with
    deterministic ordering to ensure consistent ring IDs across multiple runs:
    
    Process:
    1. Consolidate: Merge overlapping cycles that share common members
    2. Member Sort: Sort account IDs alphabetically within each ring
    3. Global Sort: Sort rings by first account_id in each ring
    4. Sequential ID: Assign RING_001, RING_002, etc. based on sorted order
    
    This ensures that running the same CSV twice produces identical ring IDs.
    For example, if ACC_001 is in a ring, it will always be in RING_001.
    
    Args:
        graph: networkx.DiGraph (kept for compatibility)
        scores_dict: dict mapping account_id to {'score': float, 'patterns': list}
        analysis_results: dict with keys:
            - cycle_groups: list of lists (detected cycles)
            - smurfing_groups: list of lists (smurfing patterns)
            - shell_groups: list of lists (shell networks)
            
    Returns:
        list: List of fraud ring dicts with keys:
            - ring_id: str (format RING_001, RING_002, ...)
            - member_accounts: list of account IDs (sorted alphabetically)
            - pattern_type: str ("cycle", "smurfing", or "shell")
            - risk_score: float (0-100, rounded to 1 decimal)
    """
    # Step 1: Consolidate and merge structural groups
    candidate_groups, pattern_types, account_cycle_count = _combine_structural_groups(analysis_results)
    
    if not candidate_groups:
        return []
    
    # Step 2: Member Sort - already done in _combine_structural_groups
    # Each group now has alphabetically sorted members
    
    # Step 3: Global Sort - sort rings by first account_id
    sorted_groups, sorted_pattern_types = _sort_rings_deterministically(candidate_groups, pattern_types)
    
    # Step 4: Sequential ID - assign RING_001, RING_002, etc.
    fraud_rings = []
    for idx, (member_accounts, pattern_type) in enumerate(zip(sorted_groups, sorted_pattern_types), start=1):
        ring_id = f"RING_{idx:03d}"
        risk_score = _calculate_ring_risk_score(member_accounts, scores_dict, account_cycle_count)
        
        fraud_rings.append({
            'ring_id': ring_id,
            'member_accounts': member_accounts,
            'pattern_type': pattern_type,
            'risk_score': risk_score
        })
    
    return fraud_rings
