import networkx as nx
from datetime import timedelta
from collections import defaultdict


def detect_cycles(G, min_length=3, max_length=5, time_window_hours=72):
    """
    Detect circular fund routing (cycles) where money flows in a loop.
    
    Criteria:
    - Cycle length between 3 and 5
    - All transactions within 72 hours
    
    Returns:
        cycle_nodes: set of nodes involved in cycles
        cycle_groups: list of cycle node lists
        cycle_metadata: dict mapping nodes to cycle details
    """
    cycle_nodes = set()
    cycle_groups = []
    cycle_metadata = {}
    
    try:
        cycles = list(nx.simple_cycles(G))
    except:
        return cycle_nodes, cycle_groups, cycle_metadata
    
    for cycle in cycles:
        if len(cycle) < min_length or len(cycle) > max_length:
            continue
        
        # Get all edges in the cycle
        edges = []
        for i in range(len(cycle)):
            src = cycle[i]
            dst = cycle[(i + 1) % len(cycle)]
            
            if G.has_edge(src, dst):
                edge_data = G[src][dst]
                edges.append(edge_data)
        
        if not edges:
            continue
        
        # Check temporal constraint
        timestamps = [edge['timestamp'] for edge in edges]
        time_span = max(timestamps) - min(timestamps)
        
        if time_span <= timedelta(hours=time_window_hours):
            cycle_nodes.update(cycle)
            cycle_groups.append(list(cycle))
            
            # Store metadata for each node
            for node in cycle:
                cycle_metadata[node] = f"cycle_length_{len(cycle)}"
    
    return cycle_nodes, cycle_groups, cycle_metadata


def detect_smurfing(G, threshold=10, time_window_hours=72):
    """
    Detect smurfing patterns (fan-in / fan-out).
    
    Criteria:
    - Fan-in: 10+ senders → 1 receiver within 72 hours
    - Fan-out: 1 sender → 10+ receivers within 72 hours
    
    Returns:
        smurfing_nodes: set of nodes involved in smurfing
        smurfing_groups: list of smurfing groups
        smurfing_metadata: dict mapping nodes to pattern details
    """
    smurfing_nodes = set()
    smurfing_groups = []
    smurfing_metadata = {}
    
    # Detect fan-in patterns
    for node in G.nodes():
        predecessors = list(G.predecessors(node))
        
        if len(predecessors) >= threshold:
            # Check temporal constraint
            in_edges = [(pred, node) for pred in predecessors]
            timestamps = [G[pred][node]['timestamp'] for pred in predecessors]
            
            if timestamps:
                time_span = max(timestamps) - min(timestamps)
                
                if time_span <= timedelta(hours=time_window_hours):
                    group = predecessors + [node]
                    smurfing_nodes.update(group)
                    smurfing_groups.append(group)
                    smurfing_metadata[node] = f"fan_in_{len(predecessors)}"
    
    # Detect fan-out patterns
    for node in G.nodes():
        successors = list(G.successors(node))
        
        if len(successors) >= threshold:
            # Check temporal constraint
            out_edges = [(node, succ) for succ in successors]
            timestamps = [G[node][succ]['timestamp'] for succ in successors]
            
            if timestamps:
                time_span = max(timestamps) - min(timestamps)
                
                if time_span <= timedelta(hours=time_window_hours):
                    group = [node] + successors
                    smurfing_nodes.update(group)
                    smurfing_groups.append(group)
                    smurfing_metadata[node] = f"fan_out_{len(successors)}"
    
    return smurfing_nodes, smurfing_groups, smurfing_metadata


def detect_shell_networks(G, min_hops=3, max_tx_count=3):
    """
    Detect layered shell networks.
    
    Criteria:
    - Chains of 3+ hops
    - Intermediate accounts have only 2-3 total transactions
    
    Returns:
        shell_nodes: set of nodes in shell networks
        shell_groups: list of shell chain paths
        shell_metadata: dict mapping nodes to pattern details
    """
    shell_nodes = set()
    shell_groups = []
    shell_metadata = {}
    
    # Find all simple paths
    for source in G.nodes():
        for target in G.nodes():
            if source == target:
                continue
            
            try:
                paths = list(nx.all_simple_paths(G, source, target, cutoff=8))
            except:
                continue
            
            for path in paths:
                if len(path) < min_hops:
                    continue
                
                # Check if intermediate nodes are shell accounts
                is_valid_shell = True
                intermediate_nodes = path[1:-1]
                
                for node in intermediate_nodes:
                    total_tx = G.in_degree(node) + G.out_degree(node)
                    
                    if total_tx > max_tx_count:
                        is_valid_shell = False
                        break
                
                if is_valid_shell and intermediate_nodes:
                    shell_nodes.update(path)
                    shell_groups.append(path)
                    
                    # Store metadata
                    for node in intermediate_nodes:
                        shell_metadata[node] = f"shell_hop_{len(path)}"
    
    return shell_nodes, shell_groups, shell_metadata


def detect_velocity(G, pass_through_threshold=0.85, avg_time_hours=24):
    """
    Detect high-velocity pass-through accounts.
    
    Criteria:
    - pass_through_rate = total_out / total_in > 0.85
    - Average time between receive and send < 24 hours
    
    Returns:
        velocity_nodes: set of flagged nodes
        velocity_metadata: dict mapping nodes to velocity details
    """
    velocity_nodes = set()
    velocity_metadata = {}
    
    for node in G.nodes():
        # Calculate total in and out
        total_in = sum(G[pred][node]['amount'] for pred in G.predecessors(node))
        total_out = sum(G[node][succ]['amount'] for succ in G.successors(node))
        
        if total_in == 0:
            continue
        
        pass_through_rate = total_out / total_in
        
        if pass_through_rate <= pass_through_threshold:
            continue
        
        # Calculate average time between receive and send
        in_times = [G[pred][node]['timestamp'] for pred in G.predecessors(node)]
        out_times = [G[node][succ]['timestamp'] for succ in G.successors(node)]
        
        if not in_times or not out_times:
            continue
        
        # Average time from first receive to first send
        time_diffs = []
        for in_time in in_times:
            for out_time in out_times:
                if out_time > in_time:
                    time_diffs.append((out_time - in_time).total_seconds() / 3600)
        
        if time_diffs:
            avg_time = sum(time_diffs) / len(time_diffs)
            if avg_time < avg_time_hours:
                velocity_nodes.add(node)
                velocity_metadata[node] = "high_velocity"
    
    return velocity_nodes, velocity_metadata


def detect_all_patterns(G):
    """
    Run all detection algorithms on the graph.
    
    Returns:
        Dictionary with all detection results
    """
    cycle_nodes, cycle_groups, cycle_metadata = detect_cycles(G)
    smurfing_nodes, smurfing_groups, smurfing_metadata = detect_smurfing(G)
    shell_nodes, shell_groups, shell_metadata = detect_shell_networks(G)
    velocity_nodes, velocity_metadata = detect_velocity(G)
    
    return {
        "cycle_nodes": cycle_nodes,
        "cycle_groups": cycle_groups,
        "cycle_metadata": cycle_metadata,
        "smurfing_nodes": smurfing_nodes,
        "smurfing_groups": smurfing_groups,
        "smurfing_metadata": smurfing_metadata,
        "shell_nodes": shell_nodes,
        "shell_groups": shell_groups,
        "shell_metadata": shell_metadata,
        "velocity_nodes": velocity_nodes,
        "velocity_metadata": velocity_metadata
    }
