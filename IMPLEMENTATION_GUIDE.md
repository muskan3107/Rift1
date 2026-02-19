# MuleRift 3D Dashboard - Implementation Guide

## Quick Start

### 1. Install Dependencies
```bash
cd Rift
npm install react-force-graph-3d three lucide-react
```

### 2. Start Development Server
```bash
npm run dev
```

### 3. Access Dashboard
Navigate to: `http://localhost:3000/dashboard`

## Component Breakdown

### Graph3D.tsx - The Core Visualization

**Key Features:**
- Renders 3D force-directed graph
- Dynamic node coloring based on suspicion score
- Animated particle flow on edges
- Ring isolation with dimming effect
- Search and whitelist filtering

**Props:**
```typescript
{
  accounts: SuspiciousAccount[];      // All accounts from analysis
  rings: FraudRing[];                 // Detected fraud rings
  edges: GraphEdge[];                 // Transaction edges
  onNodeClick: (account) => void;     // Node click handler
  selectedRingId: string | null;      // Currently selected ring
  searchQuery: string;                // Search filter
  hideWhitelisted: boolean;           // Whitelist toggle
  timeVelocityFilter: number;         // Time window (0-72 hours)
}
```

**Visual Logic:**
```typescript
// High-risk nodes (score > 70)
color: "#FF3131"  // Neon red
size: 15          // Larger

// Selected ring nodes
color: "#00FFFF"  // Cyan
opacity: 1

// Dimmed nodes (when ring selected)
color: "#334155"  // Dark gray
opacity: 0.2

// Normal nodes
color: "#3B82F6"  // Blue
size: 8
```

### ExplainableRiskPanel.tsx - Risk Analysis Sidebar

**Opens when:** User clicks any node in 3D graph

**Displays:**
1. Account ID (monospace)
2. Large suspicion score (red, 92% style)
3. Risk factor breakdown:
   - Cycle Involvement (60% weight)
   - Temporal Velocity (40% weight)
4. Ring membership badge
5. Scoring methodology

**Pattern Parsing:**
```typescript
// detected_patterns format: ["cycle_participation:2", "temporal_velocity:1"]
const patterns = account.detected_patterns.reduce((acc, pattern) => {
  const [type, count] = pattern.split(":");
  acc[type] = parseInt(count) || 0;
  return acc;
}, {});
```

### FraudRingTable3D.tsx - Ring Isolation Table

**Key Feature:** Click-to-isolate functionality

**Behavior:**
1. Click ring row → Isolate ring in 3D view
2. Selected ring highlighted in cyan
3. All other nodes/edges dimmed
4. "RING ID: XXX - CIRCULAR ROUTING" indicator appears
5. Click again → Deselect and restore full view

**Visual States:**
```typescript
// Selected row
bg-cyan-500/20
border-cyan-500/50

// Hover state
hover:bg-slate-800/50

// Ring ID indicator
{selectedRingId && (
  <div className="absolute bottom-4 left-1/2 -translate-x-1/2">
    RING ID: {selectedRingId} - CIRCULAR ROUTING
  </div>
)}
```

### TimeVelocitySlider.tsx - Time Filter

**Range:** 0-72 hours

**Filtering Logic:**
```typescript
const filteredEdges = edges.filter((edge) => {
  const timestamp = new Date(edge.earliest_timestamp);
  const now = new Date();
  const hoursDiff = (now.getTime() - timestamp.getTime()) / (1000 * 60 * 60);
  return hoursDiff <= timeVelocityFilter;
});
```

**Visual Design:**
- Gradient slider (cyan to gray)
- Time markers every 8 hours
- Current value displayed as "XX-00"
- Glowing thumb on hover

### Dashboard3D.tsx - Main Container

**State Management:**
```typescript
const [selectedAccount, setSelectedAccount] = useState<SuspiciousAccount | null>(null);
const [selectedRingId, setSelectedRingId] = useState<string | null>(null);
const [searchQuery, setSearchQuery] = useState("");
const [hideWhitelisted, setHideWhitelisted] = useState(false);
const [timeVelocityFilter, setTimeVelocityFilter] = useState(72);
```

**Layout:**
```
┌─────────────────────────────────────────────────────┐
│ Header: MULE RIFT + Download Button                │
├─────────────────────────────────────────────────────┤
│ Search Bar | Hide Known Business Nodes Toggle      │
├─────────────────────────────────────────────────────┤
│                                                     │
│              3D Graph Visualization                 │
│                                                     │
│         [Ring ID Indicator if selected]             │
├─────────────────────────────────────────────────────┤
│ Time Velocity Slider (0-72 hours)                  │
├─────────────────────────────────────────────────────┤
│ Fraud Ring Table (click to isolate)                │
└─────────────────────────────────────────────────────┘
                                    ┌──────────────────┐
                                    │ Explainable Risk │
                                    │ Panel (sidebar)  │
                                    └──────────────────┘
```

## Data Flow

### 1. Load Analysis Data
```typescript
// app/dashboard/page.tsx
fetch("/api/sample")
  .then(res => res.json())
  .then(data => {
    setData(data);  // Contract-compliant AnalysisResult
  });
```

### 2. Generate Graph Edges
```typescript
// lib/graphUtils.ts
const edges = generateGraphEdges(data);
// Creates edges from fraud rings and random connections
```

### 3. Pass to Dashboard
```typescript
<Dashboard3D data={data} edges={edges} />
```

### 4. User Interactions
```
User Action                 → State Update              → Visual Effect
─────────────────────────────────────────────────────────────────────
Click node                  → setSelectedAccount()     → Open risk panel
Click ring row              → setSelectedRingId()      → Isolate ring
Type in search              → setSearchQuery()         → Filter nodes
Toggle whitelist            → setHideWhitelisted()     → Hide nodes
Drag time slider            → setTimeVelocityFilter()  → Filter edges
```

## Styling Guide

### Theme Colors
```css
/* Background */
bg-slate-950    /* Main background */
bg-slate-900    /* Panels */
bg-slate-800    /* Hover states */

/* Accents */
text-cyan-400   /* Headers, labels */
border-cyan-500 /* Borders, highlights */

/* Risk Levels */
text-red-500    /* High risk (>70) */
text-yellow-500 /* Medium risk (50-70) */
text-green-500  /* Low risk (<50) */

/* Graph Colors */
#FF3131         /* High-risk nodes */
#00FFFF         /* Selected ring */
#3B82F6         /* Normal nodes */
#06B6D4         /* Edges */
```

### Typography
```css
/* Headers */
text-sm font-semibold tracking-wider uppercase

/* Scores */
text-6xl font-bold

/* Account IDs */
font-mono

/* Body */
text-sm text-slate-400
```

### Effects
```css
/* Glassmorphism */
bg-slate-900/80 backdrop-blur-sm

/* Borders */
border border-cyan-500/20

/* Hover */
hover:bg-slate-800 transition-colors

/* Glow */
box-shadow: 0 0 10px rgba(6, 182, 212, 0.5)
```

## API Integration

### Sample Data Endpoint
```typescript
// GET /api/sample
// Returns: AnalysisResult (contract-compliant)

{
  suspicious_accounts: [...],
  fraud_rings: [...],
  summary: {...}
}
```

### Upload Endpoint (Future)
```typescript
// POST /api/analyze
// Body: FormData with CSV file
// Returns: AnalysisResult

const formData = new FormData();
formData.append("file", csvFile);

fetch("/api/analyze", {
  method: "POST",
  body: formData
});
```

## Testing Checklist

### Visual Tests
- [ ] High-risk nodes are red and larger
- [ ] Particles animate along edges
- [ ] Ring isolation highlights correctly
- [ ] Dimming effect works when ring selected
- [ ] Search filters nodes in real-time
- [ ] Whitelist toggle hides nodes
- [ ] Time slider filters edges

### Interaction Tests
- [ ] Click node opens risk panel
- [ ] Click ring row isolates ring
- [ ] Click again deselects ring
- [ ] Search bar filters accounts
- [ ] Toggle switches whitelist mode
- [ ] Slider updates time filter
- [ ] Download button exports JSON

### Performance Tests
- [ ] Graph renders smoothly with 50+ nodes
- [ ] Filtering is instant (<100ms)
- [ ] No lag when dragging slider
- [ ] Particle animation is smooth (60fps)

## Common Issues & Solutions

### Issue: Graph not rendering
**Solution:** Check browser console for WebGL errors. Ensure GPU acceleration is enabled.

### Issue: Particles not animating
**Solution:** Verify `linkDirectionalParticles` prop is set in Graph3D.tsx

### Issue: Ring isolation not working
**Solution:** Check that `selectedRingId` state is properly passed to Graph3D

### Issue: Time filter not updating
**Solution:** Ensure `timeVelocityFilter` triggers useEffect in Graph3D

### Issue: Styling looks wrong
**Solution:** Verify Tailwind CSS is configured and classes are not purged

## Deployment

### Build for Production
```bash
npm run build
npm start
```

### Environment Variables
```env
# None required for basic functionality
# Add if using external APIs
```

### Performance Optimization
```typescript
// Use dynamic import for 3D library
const ForceGraph3D = dynamic(() => import("react-force-graph-3d"), {
  ssr: false,
});

// Memoize graph data
const graphData = useMemo(() => ({
  nodes: filteredNodes,
  links: filteredLinks
}), [filteredNodes, filteredLinks]);
```

## Next Steps

1. Test with real transaction data
2. Add more pattern types (smurfing, shell)
3. Implement real-time data streaming
4. Add export functionality for 3D views
5. Create mobile-responsive version
6. Add accessibility features (keyboard navigation)
7. Implement user preferences (theme, layout)
8. Add tutorial/onboarding flow

## Support

For issues or questions:
1. Check browser console for errors
2. Verify data format matches contract
3. Review component props and state
4. Test with sample data first
5. Check 3D_DASHBOARD_README.md for details
