# Developer Productivity Dashboard

## Innovation Hacks Full Stack Development Internship

## Task 1 - Modern Frontend Development

---

## Overview

**DevFlow** is a modern, developer-focused SaaS productivity dashboard built for **Task 1** of the **Innovation Hacks Full Stack Development Internship**. It empowers engineers and engineering leads to monitor active sprint initiatives, track task completions, observe team workload, review git velocity metrics, and navigate project timelines seamlessly.

The application is built strictly as a client-side frontend using realistic local mock data, adhering to modern UI/UX design principles: clean typography, deliberate spacing, rounded cards, subtle shadows, high accessibility, and full responsiveness across desktop, tablet, and mobile devices.

---

## Features

- **Live Statistics Overview**: 4 core productivity metrics (Total Projects, Total Tasks, Completed Tasks, Overall Progress) with trend indicators. Dynamic calculations reflect task state changes in real time.
- **Projects Grid**: Comprehensive project cards displaying project names, descriptions, categorical badges, progress bars, task counts, due dates, and contributor avatars.
- **Interactive Task Management**: Real-time task board with clickable status checkboxes/badges that cycle tasks through `Todo` -> `In Progress` -> `Done`, automatically adjusting progress metrics.
- **Multi-Factor Real-time Search**: Instant live searching across project names, project descriptions, task titles, and associated project names.
- **Granular Task Filters**: Filter tasks concurrently by status (`All`, `Todo`, `In Progress`, `Done`) and priority (`All`, `Low`, `Medium`, `High`) with active result counters and instant "Clear Filters" reset.
- **Live Activity Feed**: Chronological log of recent development events (commits, task status changes, project creation, pull request merges).
- **Interactive Project Creation**: Polished "+ New Project" modal with validation that appends projects to the live state and updates productivity telemetry.
- **Project & Task Detail Modals**: Clickable project and task inspection modals with contributor breakdowns, due dates, and status toggles.
- **Notifications & Profile Menus**: Functional navbar popovers for viewing sprint notifications with "Mark all as read" and viewing developer profile credentials.
- **Simulated States**: Built-in state triggers to test the animated skeleton **Loading State** and resilient **Error State** with working "Try Again" recovery.
- **Zero Horizontal Overflow**: Guaranteed responsive layout optimized for all viewport sizes.

---

## Tech Stack

- **Framework**: [React.js](https://react.dev/) (v19)
- **Build Tool**: [Vite](https://vitejs.dev/)
- **Language**: JavaScript (ESModules)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) (v3)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Data Layer**: Mock/Local Data (`src/data/mockData.js`)

---

## Project Structure

```
src/
├── components/
│   ├── ActivityItem.jsx    # Feed item with timeline node and timestamp
│   ├── EmptyState.jsx      # Empty state with icon and "Clear Filters" action
│   ├── ErrorState.jsx      # Error screen with functional "Try Again" reset
│   ├── FilterBar.jsx       # Status and priority filter pills with clear button
│   ├── LoadingState.jsx    # Animated skeleton loader for cards, grids, and rows
│   ├── Modal.jsx           # Reusable accessible dialog modal with backdrop blur
│   ├── Navbar.jsx          # Top navigation with search, notifications, and profile
│   ├── ProgressBar.jsx     # Dynamic color progress bar with ARIA accessibility
│   ├── ProjectCard.jsx     # Project card with progress, team avatars, and metadata
│   ├── SearchBar.jsx       # Live search input with keyboard shortcut & clear button
│   ├── Sidebar.jsx         # Collapsible desktop sidebar & mobile slide-out drawer
│   ├── StatCard.jsx        # Reusable metric card with icons and trend badges
│   └── TaskCard.jsx        # Interactive task card with status cycling and badges
│
├── data/
│   └── mockData.js         # Realistic datasets for projects, tasks, user, activity
│
├── pages/
│   └── Dashboard.jsx       # Main coordinating dashboard view with full interactivity
│
├── App.jsx                 # App layout wrapper, navigation coordinator, and footer
├── main.jsx                # Application root entry point
└── index.css               # Tailwind CSS directives and custom typography rules
```

---

## Installation

Follow these steps to run the application locally:

```bash
# 1. Install dependencies
npm install

# 2. Start Vite development server
npm run dev
```

The application will start locally at `http://localhost:5173/` (or the port indicated in your terminal).

To create an optimized production build:

```bash
npm run build
```

To preview the production build locally:

```bash
npm run preview
```

---

## Available Features

| Feature Area | Description | Status |
| :--- | :--- | :--- |
| **Productivity Statistics** | Total Projects (8), Total Tasks (24), Completed Tasks (16), Overall Progress (72%) | Completed |
| **Projects Showcase** | AI Task Manager, E-Commerce Platform, Mobile Banking App, Portfolio Website, +4 more | Completed |
| **Interactive Tasks** | Live status toggle between `Todo`, `In Progress`, and `Done` with strikethrough | Completed |
| **Real-Time Search** | Matches project names, descriptions, task titles, and parent projects simultaneously | Completed |
| **Status & Priority Filtering** | Filter tasks by `Todo`, `In Progress`, `Done` and `Low`, `Medium`, `High` | Completed |
| **Clear Filters Action** | One-click reset in FilterBar and EmptyState components | Completed |
| **New Project Creation** | Modal with form fields, validation, and auto-generated feed updates | Completed |
| **Responsive Sidebar** | Fully functional navigation: Dashboard, Projects, Tasks, Analytics, Settings | Completed |
| **Mobile Drawer Navigation** | Slide-out overlay drawer on mobile viewports with hamburger toggle | Completed |
| **Skeleton Loading State** | Realistic animated skeleton UI for stats, cards, and task lists | Completed |
| **Empty State** | Contextual zero-results state with icon and filter reset button | Completed |
| **Error State** | Error card with working "Try Again" recovery action | Completed |
| **Design Consistency** | Tailwind palette adhering to required background, primary, dark, and status colors | Completed |

---

## Responsive Design

The dashboard layout is designed mobile-first and optimized for three primary device tiers:

1. **Desktop (1280px+)**:
   - Fixed left sidebar with brand logo, workspace badges, streak indicator, and user info.
   - Sticky top navbar with global search, notifications popover, and profile dropdown.
   - Multi-column layout: 4-column statistics grid, 2-column project cards, and a 2:1 split between Tasks and Recent Activity feed.
2. **Tablet (768px - 1024px)**:
   - Sidebar automatically transitions into a collapsible slide-out drawer.
   - 2-column statistics and responsive project cards.
   - Search bar and filter controls neatly wrap without horizontal scroll.
3. **Mobile (375px - 640px)**:
   - Sidebar becomes a smooth slide-out drawer accessible via the top hamburger button.
   - Full backdrop blur overlay with tap-to-dismiss behavior.
   - Statistics, projects, and task cards stack into single columns with touch-friendly tap targets.
   - Strict `overflow-x: hidden` guarantees no horizontal overflow.

---

## Screenshots

<!-- Add your application screenshots here -->
*(Screenshots can be added here following local testing and demo recording)*

---

## Demo Video

<!-- Add your demo video link here -->
*(Demo video link placeholder)*

---

## Author

**Aswin Muthaiya**  
Full Stack Development Intern  
Innovation Hacks
