# DevFlow AI — AI-Powered Project & Task Management Platform

## Innovation Hacks Full Stack Development Internship — Task 4 Final Deliverable

---

## Project Overview

**DevFlow AI** is a production-ready, full-stack project and task management platform that bridges developer workflows with artificial intelligence. Building upon the foundational work of Task 1 (React/Vite Frontend), Task 2 (Node.js/Express REST API), and Task 3 (MongoDB Atlas Database Integration), Task 4 introduces secure JWT authentication, real-time MongoDB synchronization across all views, and an **AI Task Generator** powered by Google Gemini with domain-aware fallback resilience.

- **Frontend Repository**: [https://github.com/Aswin9342373834/innovation-hacks-task-1-devflow](https://github.com/Aswin9342373834/innovation-hacks-task-1-devflow)
- **Backend Repository**: [https://github.com/Aswin9342373834/innovation-hacks-task-2-devflow-api](https://github.com/Aswin9342373834/innovation-hacks-task-2-devflow-api)
- **Live Backend API**: [https://innovation-hacks-task-2-devflow-api.onrender.com](https://innovation-hacks-task-2-devflow-api.onrender.com)
- **Health Check**: [https://innovation-hacks-task-2-devflow-api.onrender.com/api/health](https://innovation-hacks-task-2-devflow-api.onrender.com/api/health)

---

## Features

### 1. Authentication & Security
- **Secure Registration & Login**: User authentication with `bcryptjs` password hashing (salt rounds: 10).
- **JWT Protection**: Signed JSON Web Tokens with strict environment variable enforcement (`process.env.JWT_SECRET`).
- **Safe Serialization**: Sensitive fields like `passwordHash` are stripped from all API outputs via Mongoose schema transforms.
- **Protected Client Routes**: React Context manages persistent login state across browser reloads via Bearer token verification (`GET /api/auth/me`).

### 2. Live Dashboard
- **MongoDB Atlas Aggregate Metrics**: Real-time counters for Total Projects, Active Projects, Total Tasks, Completed Tasks, and Overall Workspace Progress.
- **Interactive Quick-Status**: Cycle task status (`Todo` → `In Progress` → `Done`) directly from cards with instant backend persistence.
- **Embedded AI Quick Generator**: Launch task generation workflows directly from the dashboard overview.

### 3. Project Management
- Full CRUD operations with MongoDB Atlas persistence.
- Create, inspect, edit, and delete projects with real-time status and progress updates.
- Cascading delete safeguards: Deleting a project cleanly removes associated tasks.

### 4. Task Management
- Dual-view interface: Interactive **Kanban Board** (`Todo`, `In Progress`, `Done`) and responsive **List View**.
- Filter concurrently by Status, Priority (`Low`, `Medium`, `High`), and Project association.
- Modal forms for creating, editing, and deleting individual tasks.

---

## AI Feature

### Primary Feature: AI Task Generator
- **Workflow**: User inputs a high-level goal (e.g., *"Build an e-commerce mobile application"*).
- **Decomposition**: DevFlow AI calls Google Gemini (`gemini-1.5-flash`) via the backend to decompose the objective into 4–8 concrete engineering tasks with titles, descriptions, priorities, and estimated hours.
- **Interactive Review**: Users review, modify, check/uncheck tasks before persisting them.
- **MongoDB Batch Persistence**: Clicking *"Save Selected Tasks"* batch-creates tasks in MongoDB associated with the selected project.
- **Offline & Fallback Resilience**: If `AI_API_KEY` is omitted or the provider reaches quota, an intelligent domain-aware heuristic generator seamlessly synthesizes structured tasks without crashing.

### Secondary Feature: AI Productivity Suggestions
- Analyzes existing project tasks to identify high-priority bottlenecks, work-in-progress (WIP) limit warnings, and sprint velocity insights.

---

## Tech Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | React 19, Vite 8, Tailwind CSS v3, Lucide Icons |
| **Backend API** | Node.js, Express 4.21, express-validator 7.2, cors, dotenv |
| **Database** | MongoDB Atlas, Mongoose 9.10 ODM |
| **Security & Auth** | JSON Web Tokens (`jsonwebtoken`), `bcryptjs` |
| **AI Provider** | Google Gemini REST API (`gemini-1.5-flash`) + Resilient Smart Engine Fallback |
| **Testing** | Node.js Test Runner (`node:test`), Supertest, MongoDB Memory Server |

---

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│              React 19 / Vite Frontend UI                │
│  (AuthContext • Dashboard • Projects • Tasks • AI View) │
└────────────────────────────┬────────────────────────────┘
                             │  HTTP + Bearer JWT
                             ▼
┌─────────────────────────────────────────────────────────┐
│               Node.js + Express REST API                │
│ (authRoutes • userRoutes • projectRoutes • taskRoutes)  │
└──────────────┬───────────────────────────┬──────────────┘
               │                           │
               │ Mongoose ODM              │ Google Gemini API
               ▼                           ▼
┌────────────────────────────┐  ┌─────────────────────────┐
│     MongoDB Atlas Cluster  │  │    Google Gemini LLM    │
│  (Users, Projects, Tasks)  │  │  (Smart Fallback Engine)│
└────────────────────────────┘  └─────────────────────────┘
```

---

## Folder Structure

```
DevFlow-AI/
├── src/                               # Frontend (React 19 + Vite)
│   ├── components/                    # Reusable UI components
│   │   ├── Navbar.jsx                 # Top bar with user profile & AI shortcut
│   │   ├── Sidebar.jsx                # Collapsible navigation drawer
│   │   ├── ProjectCard.jsx            # Project card with progress
│   │   ├── TaskCard.jsx               # Interactive task card
│   │   ├── StatCard.jsx               # Metric card
│   │   ├── FilterBar.jsx              # Status and priority filters
│   │   └── Modal.jsx                  # Accessible dialog modal
│   ├── context/
│   │   └── AuthContext.jsx            # JWT authentication state & provider
│   ├── pages/
│   │   ├── Dashboard.jsx              # Main dashboard overview
│   │   ├── ProjectsView.jsx           # Full project CRUD management
│   │   ├── TasksView.jsx              # Kanban & list task management
│   │   ├── AIAssistantView.jsx        # AI Task Generator & suggestions
│   │   ├── SettingsView.jsx           # Profile & API diagnostics
│   │   ├── Login.jsx                  # User login view
│   │   └── Register.jsx               # User registration view
│   └── services/
│       ├── api.js                     # Centralized API fetch wrapper
│       ├── authService.js             # Auth endpoints
│       ├── projectService.js          # Project CRUD endpoints
│       ├── taskService.js             # Task CRUD endpoints
│       └── aiService.js               # AI generator & suggestions
│
├── DevFlow-API/                       # Backend (Node.js + Express REST API)
│   ├── src/
│   │   ├── config/                    # Database (Mongoose) & JWT configs
│   │   ├── controllers/               # Route controllers (Auth, AI, Projects, Tasks, Users)
│   │   ├── middleware/                # Auth, Error & 404 middleware
│   │   ├── models/                    # Mongoose schemas (User, Project, Task)
│   │   ├── routes/                    # Express routers
│   │   ├── services/                  # Gemini AI service & fallback engine
│   │   └── validators/                # express-validator schemas
│   ├── tests/
│   │   ├── api.test.js                # 38 Task 3 baseline tests
│   │   └── auth_and_ai.test.js        # 12 Task 4 Auth & AI tests
│   └── render.yaml                    # Render Web Service blueprint
│
├── .env.example                       # Frontend environment template
└── README.md                          # Platform documentation
```

---

## Environment Variables

### Frontend (`.env` or hosting settings)
```env
# URL pointing to the running backend
VITE_API_URL=http://localhost:5000
```

### Backend (`DevFlow-API/.env` or Render settings)
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster>/<database>?retryWrites=true&w=majority
JWT_SECRET=your_secure_random_jwt_secret_key_min_32_characters
AI_API_KEY=your_google_gemini_api_key_here
```

> [!CAUTION]
> Never commit `.env` files or production credentials to Git. Both repositories contain properly configured `.gitignore` rules that prevent `.env` from being tracked.

---

## Local Installation

### 1. Clone the repository
```bash
git clone https://github.com/Aswin9342373834/innovation-hacks-task-1-devflow.git DevFlow-AI
cd DevFlow-AI
```

### 2. Set up Backend
```bash
cd DevFlow-API
npm install
cp .env.example .env
# Edit .env and supply your MONGODB_URI, JWT_SECRET, and AI_API_KEY
```

### 3. Set up Frontend
```bash
cd ..
npm install
cp .env.example .env
```

---

## Running Locally

### Start Backend
```bash
cd DevFlow-API
npm run dev
# Server starts at http://localhost:5000
```

### Start Frontend
```bash
# In project root
npm run dev
# Vite server starts at http://localhost:5173
```

---

## API Endpoints

### Authentication
| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Register new user & return JWT | No |
| `POST` | `/api/auth/login` | Authenticate user & return JWT | No |
| `GET` | `/api/auth/me` | Return authenticated user profile | Yes (Bearer) |
| `POST` | `/api/auth/logout` | Client sign-out acknowledgment | No |

### AI Intelligence
| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/ai/generate-tasks` | Decompose goal into 4–8 tasks via Gemini | Optional |
| `POST` | `/api/ai/save-tasks` | Batch persist approved AI tasks to MongoDB | Optional |
| `GET` | `/api/ai/productivity-suggestions` | Velocity and bottleneck insights | Optional |

### Projects
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/projects` | List all projects (supports `?status=`) |
| `GET` | `/api/projects/:id` | Get project by ID |
| `POST` | `/api/projects` | Create a new project |
| `PUT` | `/api/projects/:id` | Update project details |
| `DELETE` | `/api/projects/:id` | Delete project and cascade-remove tasks |

### Tasks
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/tasks` | List tasks (filters: `status`, `priority`, `projectId`) |
| `GET` | `/api/tasks/:id` | Get task by ID |
| `POST` | `/api/tasks` | Create a task |
| `PUT` | `/api/tasks/:id` | Update task details |
| `PATCH` | `/api/tasks/:id/status` | Update task status (`todo`, `in-progress`, `done`) |
| `DELETE` | `/api/tasks/:id` | Delete a task |

---

## Testing

### Backend Automated Test Suite
DevFlow API includes **50 automated tests** executed against an in-memory MongoDB server:
```bash
cd DevFlow-API
npm test
```
**Results**:
- 38/38 Task 3 Database & CRUD tests passing
- 12/12 Task 4 Auth & AI tests passing
- **Total: 50 tests passing (100%), 0 failures**

### Backend Linting
```bash
cd DevFlow-API
npm run lint
# ESLint passes with 0 errors
```

### Frontend Production Build & Linting
```bash
# In project root
npm run build
# Vite bundles successfully with zero warnings/errors

npm run lint
# Oxlint passes with 0 errors
```

---

## Deployment

- **Backend (Render)**: Configured with `DevFlow-API/render.yaml` as a Node web service.
  - Environment variables set in Render dashboard: `MONGODB_URI`, `JWT_SECRET`, `AI_API_KEY`, `NODE_ENV=production`.
- **Frontend (Vercel / Netlify / GitHub Pages)**:
  - Environment variable: `VITE_API_URL=https://innovation-hacks-task-2-devflow-api.onrender.com`.

---

## Author

**Aswin Muthaiya**  
Full Stack Development Intern — Innovation Hacks  
Platform: **DevFlow AI**
