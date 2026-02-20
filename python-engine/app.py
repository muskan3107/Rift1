import os
import time
import json
from io import StringIO
from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import pandas as pd

# Import existing fraud detection logic
from graph_builder import build_graph, prune_isolated_nodes
from detectors import detect_all_patterns
from ring_grouper import group_rings_by_pattern

app = FastAPI(title="MuleRift Fraud Detection API")

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://rift-lime.vercel.app",
        "http://localhost:3000",  # For local development
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def format_float(value):
    """Format float to exactly 1 decimal place."""
    return float(f"{value:.1f}")

def calculate_suspicion_score(patterns):
    """Calculate weighted suspicion score based on detected patterns."""
    score = 0
    pattern_weights = {
        'cycle': 40,
        'smurfing': 40,
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

def analyze_csv_data(csv_content: str):
    """Analyze CSV content and return fraud detection results."""
    start_time = time.time()
    
    # Write CSV content to temporary file for graph_builder
    import tempfile
    with tempfile.NamedTemporaryFile(mode='w', suffix='.csv', delete=False) as tmp_file:
        tmp_file.write(csv_content)
        tmp_path = tmp_file.name
    
    try:
        # Build graph
        G, df = build_graph(tmp_path)
        
        # Prune isolated nodes
        G = prune_isolated_nodes(G)
        
        # Run detection algorithms
        results = detect_all_patterns(G, df)
        
        # Group rings with merging and deterministic sorting
        ring_data = group_rings_by_pattern(results)
        account_to_ring = ring_data['ring_assignments']
        
        # Build suspicious_accounts list with STRICT DETERMINISTIC ORDERING
        suspicious_accounts = []
        all_suspicious_nodes = (
            results['cycle_nodes'] | 
            results['smurfing_nodes'] | 
            results['shell_nodes'] |
            results['velocity_nodes']
        )
        
        # Sort nodes alphabetically FIRST for deterministic iteration
        for account_id in sorted(all_suspicious_nodes):
            detected_patterns = []
            
            # Add descriptive pattern names in DETERMINISTIC ORDER
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
            
            # Sort patterns alphabetically for deterministic order
            detected_patterns.sort()
            
            suspicion_score = calculate_suspicion_score(detected_patterns)
            
            # Only include accounts with score > 50
            if suspicion_score > 50:
                suspicious_accounts.append({
                    "account_id": account_id,
                    "suspicion_score": format_float(suspicion_score),
                    "detected_patterns": detected_patterns,
                    "ring_id": account_to_ring.get(account_id, "")
                })
        
        # Sort by suspicion_score DESC, then by account_id ASC for tie-breaking
        suspicious_accounts.sort(key=lambda x: (-x['suspicion_score'], x['account_id']))
        
        # Build final fraud_rings output with STRICT DETERMINISTIC ORDERING
        # CRITICAL: Sort rings_by_pattern by ring_id to ensure deterministic ordering
        ring_data['rings_by_pattern'].sort(key=lambda x: x['ring_id'])
        
        fraud_rings_output = []
        for ring_info in ring_data['rings_by_pattern']:
            ring_id = ring_info['ring_id']
            members = ring_info['members']
            pattern_type = ring_info['pattern_type']
            
            # Calculate risk score as simple average of member suspicion scores
            member_scores = []
            for account_id in members:
                account_data = next((acc for acc in suspicious_accounts if acc['account_id'] == account_id), None)
                if account_data:
                    member_scores.append(account_data['suspicion_score'])
                else:
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
                    
                    detected_patterns.sort()
                    score = calculate_suspicion_score(detected_patterns)
                    member_scores.append(score)
            
            risk_score = format_float(sum(member_scores) / len(member_scores)) if member_scores else 0.0
            
            fraud_rings_output.append({
                "ring_id": ring_id,
                "member_accounts": members,
                "pattern_type": pattern_type,
                "risk_score": risk_score
            })
        
        processing_time = time.time() - start_time
        
        # Build final output matching MuleRift contract
        output = {
            "suspicious_accounts": suspicious_accounts,
            "fraud_rings": fraud_rings_output,
            "summary": {
                "total_accounts_analyzed": G.number_of_nodes(),
                "suspicious_accounts_flagged": len(suspicious_accounts),
                "fraud_rings_detected": len(fraud_rings_output),
                "processing_time_seconds": format_float(processing_time)
            }
        }
        
        return output
    
    finally:
        # Clean up temporary file
        if os.path.exists(tmp_path):
            os.unlink(tmp_path)

@app.get("/")
async def root():
    """Health check endpoint."""
    return {"status": "ok", "service": "MuleRift Fraud Detection API"}

@app.post("/analyze")
async def analyze(file: UploadFile = File(...)):
    """
    Analyze uploaded CSV file for fraud patterns.
    
    Accepts: CSV file with columns: transaction_id, sender_id, receiver_id, amount, timestamp
    Returns: JSON with suspicious_accounts, fraud_rings, and summary
    """
    try:
        # Read uploaded file content
        content = await file.read()
        csv_content = content.decode('utf-8')
        
        # Validate CSV has content
        if not csv_content.strip():
            raise HTTPException(status_code=400, detail="Empty CSV file")
        
        # Analyze CSV
        result = analyze_csv_data(csv_content)
        
        return result
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Analysis failed: {str(e)}")
