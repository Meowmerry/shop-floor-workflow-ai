# Manufacturing Workflow Control Dashboard

A modern, role-based manufacturing workflow management system built with React, TypeScript, and Tailwind CSS. Designed for factory floor operations with intuitive interfaces for different station roles.

## 🚀 Quick Start

### Installation

```bash
npm install
```

### Development Server

```bash
npm run dev
```

The app will start at `http://localhost:5176/` (or another available port).

### Build

```bash
npm run build
```

## 📋 Features

- **Role-Based Access Control** - Different interfaces for Operators, QC Leads, Shipping, and Supervisors
- **Real-Time Workflow Tracking** - Monitor items through Saw → Thread → CNC → QC → Ship pipeline
- **Barcode Scanning** - Scan item IDs to quickly access work items
- **Hold Management** - Place items on hold with reasons for quality issues
- **Audit Trail** - Complete history of who did what and when
- **Supervisor Oversight** - Supervisors can view all station tabs and monitor operations
- **Responsive Design** - Works seamlessly on desktop and tablet interfaces

## 🎯 How to Use the App

### 1. Login & Station Selection

When you first open the app, you'll see the **Login Page** with four large role cards:

- **Operator** (Blue) - Machine operations and assembly
- **QC Lead** (Purple) - Quality control and inspection
- **Shipping** (Green) - Warehouse and shipment management
- **Supervisor** (Orange) - Floor management and oversight

**To log in:** Click on your role card to start your shift. You'll be logged in as a demo user for that role.

### 2. Dashboard Interface

After logging in, you'll see the **Dashboard** with:

- **Sidebar (Left)** - Navigation and user info
  - Shows your name, role, and station assignment
  - Navigation tabs (role-specific, or all tabs if Supervisor)
  - System status indicator

- **Header (Top)** - Tools and account management
  - Page title and current date
  - **Scan Item** button (Ctrl+K) - Quick barcode scanner
  - Notifications bell
  - User menu with **Logout** button to switch stations

- **Main Content Area** - Role-specific workflow interface

### 3. Operator View

**For machine operators working at assembly stations:**

1. **Pending Items Section** - Shows work items waiting to be started
2. **Select an Item** - Click on an item card to view details
3. **Workflow Actions:**
   - **Start Step** - Begin working on the item
   - **Complete Step** - Mark the current step as finished (item automatically advances)
   - **Place on Hold** - Temporarily pause work with a hold reason:
     - Material Defect
     - Dimension Error
     - Machine Issue
     - Surface Finish
     - Documentation Missing
     - Customer Request
   - **Release Hold** - Resume work on held items
   - **Send to Rework** - Return item to previous step for corrections

4. **View History** - Click the History icon to see complete audit trail for an item

### 4. QC (Quality Control) View

**For quality inspectors:**

1. **Items Awaiting QC** - Shows items ready for quality inspection
2. **Inspect Items** - Review item details and audit history
3. **QC Actions:**
   - **Pass QC** - Item passes quality check and advances to shipping
   - **Fail QC** - Item fails inspection with a hold reason
   - **Place on Hold** - Hold for further review

### 5. Shipping View

**For warehouse and shipping staff:**

1. **Items Ready to Ship** - Shows completed items pending shipment
2. **View Item Details** - Confirm order info, item specs, and destination
3. **Shipping Actions:**
   - **Ship Item** - Mark item as shipped and complete the workflow
   - **Place on Hold** - Hold shipment if needed

### 6. Supervisor View

**For floor managers and supervisors:**

1. **View All Stations** - Access all four tabs (Operator, QC, Shipping, Supervisor)
2. **Monitor Operations** - Switch between tabs to oversee different stations
3. **Key Metrics** - See:
   - Total items in workflow
   - Items on hold by reason
   - Bottlenecks and delays
   - Operator performance and audit trails

4. **Supervisor Actions:**
   - **Release holds** across any station
   - **Rework items** to resolve issues
   - **View complete audit history** with operator names and timestamps

### 7. Barcode Scanning

**Quick item lookup:**

- Press **Ctrl+K** (Windows/Linux) or **Cmd+K** (Mac) to open the scanner
- Type an item ID or name to search
- Click a suggestion or press Enter to scan
- Use the **Mock Scan** button (🎲) to randomly scan items for testing

### 8. Audit History

Every action in the system is tracked:

- **Who** - Operator's name
- **What** - Action taken (Started, Completed, Placed on Hold, etc.)
- **When** - Exact timestamp
- **Why** - Notes or hold reasons
- **Where** - Current workflow step

Click the **History** icon on any item to see the complete trail.

### 9. Switching Stations

**To switch to a different role:**

1. Click the **Logout** button (🚪) in the top-right corner
2. You'll return to the **Login Page**
3. Click a different role card to start as that user

## 🔄 Workflow Pipeline

Items flow through the manufacturing pipeline:

```
Pending → Saw → Thread → CNC → QC → Ship → Complete
```

Each step can be:
- ✅ **Started** - Operator begins work
- ✅ **Completed** - Step finished, item advances
- ⏸️ **On Hold** - Paused for quality issues or other reasons
- 🔄 **Rework** - Sent back to fix issues

## 📊 Demo Data

The app includes mock data with:

- 3 sample orders
- Multiple work items per order
- Different priorities and statuses
- Mock operators with realistic names
- Sample audit history entries

## 🛠 Technology Stack

- **React 19** - UI framework
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **React Router** - Navigation
- **Lucide React** - Icons
- **Vite** - Build tool

## 📝 Project Structure

```
src/
├── components/
│   ├── layout/           # Header, Sidebar, MainLayout
│   ├── views/            # Role-specific views (Operator, QC, Shipping, Supervisor)
│   ├── LoginPage.tsx     # Authentication UI
│   ├── WorkItemCard.tsx  # Item display component
│   └── ...
├── contexts/
│   ├── AuthContext.tsx   # Authentication state
│   └── WorkflowContext.tsx # Workflow operations
├── data/
│   └── mockData.ts       # Sample data
├── types/
│   ├── auth.ts           # Auth types
│   └── index.ts          # Workflow types
└── App.tsx               # Main app component
```

## 🎓 Tips for Best Experience

1. **Supervisors**: Log in as "Supervisor" to see all station tabs and monitor the entire floor
2. **Scan Items**: Use Ctrl+K to quickly find items without scrolling
3. **History Tracking**: Check item histories to understand what happened at each station
4. **Hold Reasons**: Always select an appropriate reason when placing items on hold
5. **Workflow Steps**: Items automatically advance - just mark them complete!

## 🚀 Development Notes

- Changes to code hot-reload automatically (HMR)
- All data is stored in React context (no backend)
- Mock data is reset on page refresh
- User sessions persist during app navigation

---

**Version 1.0** - Manufacturing Workflow Control Dashboard
import reactDom from 'eslint-plugin-react-dom'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```
