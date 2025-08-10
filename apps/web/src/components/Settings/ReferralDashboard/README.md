# Referral Dashboard - Modular Architecture

This directory contains the refactored Referral Dashboard with a clean, modular architecture.

## 📁 Directory Structure

```
ReferralDashboard/
├── components/          # UI Components
│   ├── StatsCards.tsx   # Statistics display cards
│   ├── FilterPanel.tsx  # Wallet address filtering
│   ├── ControlPanel.tsx # Zoom and view controls
│   ├── TreeView.tsx     # Binary tree visualization
│   ├── NodeInspector.tsx # Node data inspection panel
│   └── index.ts         # Component exports
├── hooks/               # Custom React Hooks
│   ├── useReferralData.ts # Data fetching and processing
│   ├── useTreeState.ts  # Tree state management
│   └── index.ts         # Hook exports
├── utils/               # Utility Functions
│   └── treeUtils.ts     # Tree operations and data processing
├── types/               # TypeScript Type Definitions
│   └── index.ts         # All interfaces and types
├── stores/              # State Management (Future)
├── index.tsx            # Main component orchestrator
└── README.md           # This file
```

## 🧩 Components

### StatsCards
Displays referral statistics including balance, network depth, and status.

### FilterPanel
Provides wallet address filtering functionality.

### ControlPanel
Handles zoom controls, view reset, and raw data toggle.

### TreeView
Enhanced binary tree visualization with:
- Parent and child node connections
- Interactive node selection
- Expand/collapse functionality
- Node inspection capabilities
- Copy address functionality

### NodeInspector
Side panel for detailed node data inspection.

## 🪝 Hooks

### useReferralData
Manages data fetching from smart contracts and data processing.

### useTreeState
Handles all tree-related state including:
- Expanded nodes
- Selected nodes
- Zoom and pan controls
- Filter state
- Inspector state

## 🔧 Utilities

### treeUtils
Contains utility functions for:
- Parsing referral node data
- Building tree structures
- Filtering trees
- Calculating statistics
- Data export functionality

## 🎯 Key Features

1. **Binary Tree Visualization**: Shows parent and child relationships
2. **Interactive Nodes**: Click to select, inspect, or copy addresses
3. **Zoom Controls**: Zoom in/out and reset view
4. **Node Inspector**: Detailed data panel for any node
5. **Filtering**: Search by wallet address
6. **Export**: Download referral data as JSON
7. **Responsive Design**: Works on all screen sizes

## 🚀 Usage

```tsx
import ReferralDashboard from "@/components/Settings/ReferralDashboard";

// Use in your component
<ReferralDashboard />
```

## 🔄 State Management

The component uses React hooks for state management:
- Local state for UI interactions
- Custom hooks for data fetching
- Memoized computations for performance

## 🎨 Styling

All components use Tailwind CSS for consistent styling and responsive design.

## 🔧 Future Enhancements

- Add parent node fetching and display
- Implement real-time data updates
- Add more tree visualization options
- Enhance mobile experience
- Add analytics and reporting features 