#!/usr/bin/env python3
"""
Generate robust test CSV data for MuleRift with:
- 100+ transactions
- Specific 4-account cycle (within 24 hours)
- 5-hop peel chain (10% decrease per hop)
- Random background transactions
"""

import csv
import random
from datetime import datetime, timedelta

def generate_test_data():
    transactions = []
    base_time = datetime.now()
    
    # ============================================
    # 1. INJECT 4-ACCOUNT CYCLE (within 24 hours)
    # ============================================
    cycle_accounts = ["ACC_A", "ACC_B", "ACC_C", "ACC_D"]
    cycle_amount = 5000.0
    
    for i in range(len(cycle_accounts)):
        from_acc = cycle_accounts[i]
        to_acc = cycle_accounts[(i + 1) % len(cycle_accounts)]
        
        # All transactions within 24 hours
        hours_offset = i * 5  # 5 hours apart
        timestamp = base_time - timedelta(hours=hours_offset)
        
        transactions.append({
            'from_account': from_acc,
            'to_account': to_acc,
            'amount': cycle_amount - (i * 100),  # Slight decrease
            'timestamp': timestamp.isoformat()
        })
    
    # Add more cycles for the same accounts (make it obvious)
    for i in range(len(cycle_accounts)):
        from_acc = cycle_accounts[i]
        to_acc = cycle_accounts[(i + 1) % len(cycle_accounts)]
        
        hours_offset = 30 + (i * 4)  # Another cycle 30 hours ago
        timestamp = base_time - timedelta(hours=hours_offset)
        
        transactions.append({
            'from_account': from_acc,
            'to_account': to_acc,
            'amount': cycle_amount * 0.8,
            'timestamp': timestamp.isoformat()
        })
    
    # ============================================
    # 2. INJECT 5-HOP PEEL CHAIN (10% decrease)
    # ============================================
    peel_accounts = ["PEEL_1", "PEEL_2", "PEEL_3", "PEEL_4", "PEEL_5"]
    peel_amount = 10000.0
    
    for i in range(len(peel_accounts) - 1):
        from_acc = peel_accounts[i]
        to_acc = peel_accounts[i + 1]
        
        # Each hop happens quickly (within 2 hours)
        hours_offset = 10 + (i * 2)
        timestamp = base_time - timedelta(hours=hours_offset)
        
        # Decrease by 10% each hop
        current_amount = peel_amount * (0.9 ** i)
        
        transactions.append({
            'from_account': from_acc,
            'to_account': to_acc,
            'amount': current_amount,
            'timestamp': timestamp.isoformat()
        })
    
    # ============================================
    # 3. INJECT ANOTHER CYCLE (3 accounts)
    # ============================================
    cycle2_accounts = ["RING_X", "RING_Y", "RING_Z"]
    
    for i in range(len(cycle2_accounts)):
        from_acc = cycle2_accounts[i]
        to_acc = cycle2_accounts[(i + 1) % len(cycle2_accounts)]
        
        hours_offset = 15 + (i * 3)
        timestamp = base_time - timedelta(hours=hours_offset)
        
        transactions.append({
            'from_account': from_acc,
            'to_account': to_acc,
            'amount': 3000.0 - (i * 50),
            'timestamp': timestamp.isoformat()
        })
    
    # ============================================
    # 4. GENERATE RANDOM BACKGROUND TRANSACTIONS
    # ============================================
    # Create pool of random accounts
    random_accounts = [f"ACC_{i:03d}" for i in range(1, 51)]
    
    # Add 80+ random transactions
    for _ in range(85):
        from_acc = random.choice(random_accounts)
        to_acc = random.choice([acc for acc in random_accounts if acc != from_acc])
        
        amount = random.uniform(100, 8000)
        hours_offset = random.uniform(0, 72)
        timestamp = base_time - timedelta(hours=hours_offset)
        
        transactions.append({
            'from_account': from_acc,
            'to_account': to_acc,
            'amount': round(amount, 2),
            'timestamp': timestamp.isoformat()
        })
    
    # ============================================
    # 5. ADD SOME LEGITIMATE BUSINESS ACCOUNTS
    # ============================================
    business_accounts = ["BUSINESS_A", "BUSINESS_B", "BUSINESS_C"]
    
    for business in business_accounts:
        # Business receives from multiple accounts
        for _ in range(5):
            from_acc = random.choice(random_accounts)
            hours_offset = random.uniform(0, 72)
            timestamp = base_time - timedelta(hours=hours_offset)
            
            transactions.append({
                'from_account': from_acc,
                'to_account': business,
                'amount': round(random.uniform(500, 2000), 2),
                'timestamp': timestamp.isoformat()
            })
    
    return transactions

def write_csv(transactions, filename='test_data.csv'):
    """Write transactions to CSV file."""
    with open(filename, 'w', newline='') as csvfile:
        fieldnames = ['from_account', 'to_account', 'amount', 'timestamp']
        writer = csv.DictWriter(csvfile, fieldnames=fieldnames)
        
        writer.writeheader()
        for txn in transactions:
            writer.writerow(txn)
    
    print(f"✅ Generated {len(transactions)} transactions")
    print(f"📁 Saved to: {filename}")
    print(f"\nKey patterns injected:")
    print(f"  • 4-account cycle: ACC_A → ACC_B → ACC_C → ACC_D → ACC_A")
    print(f"  • 5-hop peel chain: PEEL_1 → PEEL_2 → ... → PEEL_5 (10% decrease)")
    print(f"  • 3-account cycle: RING_X → RING_Y → RING_Z → RING_X")
    print(f"  • 85+ random background transactions")
    print(f"  • 15 business account transactions")

if __name__ == '__main__':
    transactions = generate_test_data()
    write_csv(transactions, 'test_data.csv')
    
    # Also generate in public folder for web access
    write_csv(transactions, '../public/test_data.csv')
