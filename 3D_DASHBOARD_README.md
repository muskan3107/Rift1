# MuleRift 3D Financial Forensics Dashboard

## Overview

A cutting-edge 3D visualization dashboard for real-time financial anomaly detection, built with Next.js 14, React Force Graph 3D, and Tailwind CSS.

## Features Implemented

### ✅ 3D Graph Visualization (react-force-graph-3d)
- **Nodes**: Accounts rendered as 3D spheres
- **Edges**: Directed transaction flows with animated particles
- **Visual Logic**:
  - High-risk nodes (suspicion_score > 70): Neon Red (#FF3131) and larger size
  - Normal nodes: Blue (#3B82F6)
  - Selected ring nodes: Cyan (#00FFFF)
  - Dimmed nodes: Dark gray when ring is selected
- **Particle Animation**: Shows transaction flow direction along edges

### ✅ Time Velocity Slider
- Range: 0-72 hours
- Dynamically filters graph edges based on transaction timestamps
- Real-time graph updates as slider moves
- Visual time markers every 8 hours

### ✅ Explainable Risk Side Panel
- Opens when clicking any node
- Displays:
  - Account ID
  - Large suspicion score percentage
  - Risk factor breakdown:
    - Cycle Involvement (60% weight)
    - Temporal Velocity (40% weight)
  - Ring membership (if applicable)
  - Scoring methodology explanation
- Color-coded risk indicators

### ✅ Ring Isolation (Circular Routing)
- Click any row in Fraud Ring Table to isolate
- Effects:
  - Highlights selected ring members in bright cyan
  - Dims all non-ring nodes and edges
  - Shows "RING ID: XXX - CIRCULAR ROUTING" indicator
  - Click again to deselect and restore full view

### ✅ Search & Whitelist Toggle
- **Search Bar**: Filter accounts by ID in real-time
- **Hide Known Business Nodes**: Toggle to filter whitelisted entities
- Both filters update the 3D graph dynamically

### ✅ Theme & Icons
- Background: `bg-slate-950` (dark theme)
- Accent color: Cyan (#06B6D4)
- Icons: Lucide React
- Glassmorphism effects with backdrop blur

## Component Architecture

```
Dashboard3D (Main Container)
├── Graph3D (3D Visualization)
│   ├── ForceGraph3D (react-force-graph-3d)
│   ├── Node rendering with dynamic colors
│   └── Edge rendering with particle animation
├── ExplainableRiskPanel (Right Sidebar)
│   ├── Account details
│   ├── Risk score breakdown
│   └── Pattern analysis
├── FraudRingTable3D (Bottom Table)
│   ├── Ring list with click handlers
│   └── Ring isolation logic
└── TimeVelocitySlider (Time Filter)
    ├── 0-72 hour range slider
    └── Real-time edge filtering
```

## File Structure

```
Rift/
├── components/
│   ├── Dashboard3D.tsx          # Main dashboard container
│   ├── Graph3D.tsx               # 3D graph visualization
│   ├── ExplainableRiskPanel.tsx  # Risk analysis sidebar
│   ├── FraudRingTable3D.tsx      # Ring table with isolation
│   └── TimeVelocitySlider.tsx    # Time filter slider
├── lib/
│   ├── types.ts                  # Contract-compliant types
│   └── graphUtils.ts             # Graph edge generation
├── app/
│   └── dashboard/
│       └── page.tsx              # Dashboard page
└── 3D_DASHBOARD_README.md        # This file
```

## Usage

### Running the Dashboard

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Visit the dashboard
open http://localhost:3000/dashboard
```

### Interacting with the 3D Graph

1. **Rotate**: Click and drag
2. **Zoom**: Scroll wheel
3. **Pan**: Right-click and drag
4. **Select Node**: Click on any sphere
5. **Drag Node**: Click and drag a node to reposition

### Ring Isolation Workflow

1. View the Fraud Ring Table at the bottom
2. Click any ring row to isolate
3. Graph highlights only that ring in cyan
4. All other nodes/edges are dimmed
5. Click the same row again to deselect

### Time Filtering

1. Use the Time Velocity slider at the bottom
2. Drag to adjust the time window (0-72 hours)
3. Graph automatically filters edges based on timestamps
4. Useful for analyzing recent vs. historical transactions

## Visual Design Elements

### Color Palette
- **Background**: `#020617` (slate-950)
- **High Risk**: `#FF3131` (neon red)
- **Selected Ring**: `#00FFFF` (cyan)
- **Normal Nodes**: `#3B82F6` (blue)
- **Dimmed**: `#334155` (slate-700)
- **Edges**: `#06B6D4` (cyan-500)

### Typography
- **Headers**: Cyan with tracking-wider
- **Scores**: Large, bold, red
- **Account IDs**: Monospace font
- **Body Text**: Slate-400

### Effects
- Glassmorphism with `backdrop-blur-sm`
- Glow effects on high-risk nodes
- Smooth transitions on hover/selection
- Particle animations on edges

## Data Contract Integration

The dashboard consumes the Locked Data Contract:

```typescript
interface AnalysisResult {
  suspicious_accounts: SuspiciousAccount[];
  fraud_rings: FraudRing[];
  summary: {
    total_accounts_analyzed: number;
    suspicious_accounts_flagged: number;
    fraud_rings_detected: number;
    processing_time_seconds: number;
  };
}
```

All components use snake_case keys as per contract requirements.

## Performance Considerations

- **Dynamic Import**: ForceGraph3D loaded client-side only (no SSR)
- **Memoization**: Graph data memoized to prevent unnecessary re-renders
- **Filtering**: Client-side filtering for instant updates
- **Particle Count**: Limited to 4 particles per edge for performance

## Browser Compatibility

- **Chrome/Edge**: Full support
- **Firefox**: Full support
- **Safari**: Full support (WebGL required)
- **Mobile**: Limited (3D performance may vary)

## Future Enhancements

- [ ] VR/AR mode for immersive analysis
- [ ] Real-time data streaming
- [ ] Advanced graph layouts (force-directed, hierarchical)
- [ ] Export 3D view as image/video
- [ ] Multi-ring comparison mode
- [ ] Time-series playback animation
- [ ] Heatmap overlay for transaction density

## Troubleshooting

### Graph not rendering
- Check browser console for WebGL errors
- Ensure `react-force-graph-3d` is installed
- Verify data format matches contract

### Performance issues
- Reduce particle count in Graph3D.tsx
- Limit number of visible nodes with filters
- Use Chrome for best WebGL performance

### Styling issues
- Ensure Tailwind CSS is configured
- Check for conflicting global styles
- Verify lucide-react icons are installed

## Credits

- **3D Engine**: react-force-graph-3d
- **Icons**: Lucide React
- **Styling**: Tailwind CSS
- **Framework**: Next.js 14
- **Design**: Based on financial forensics mockup
