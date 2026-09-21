import React, { useState, useEffect } from "react";
import { Code2 } from "lucide-react";
import { AuthProvider, useAuth } from "./context/AuthContext";
import Sidebar from "./components/Sidebar";
import Navbar from "./components/Navbar";
import Dashboard from "./pages/Dashboard";
import ProjectsView from "./pages/ProjectsView";
import TasksView from "./pages/TasksView";
import AIAssistantView from "./pages/AIAssistantView";
import SettingsView from "./pages/SettingsView";
import Login from "./pages/Login";
import Register from "./pages/Register";
import projectService from "./services/projectService";
import taskService from "./services/taskService";

function AppContent() {
  const { isAuthenticated, loading } = useAuth();

  // Auth toggle view for unauthenticated visitors
  const [authView, setAuthView] = useState("login"); // 'login' | 'register'

  // Application shell navigation states
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeView, setActiveView] = useState("Dashboard");
  const [searchQuery, setSearchQuery] = useState("");
  const [targetProjectIdForTasks, setTargetProjectIdForTasks] = useState(null);

  // Live counts for sidebar badges
  const [counts, setCounts] = useState({ projects: 0, tasks: 0 });

  // Update counts when activeView changes or on mount
  useEffect(() => {
    if (!isAuthenticated) return;

    let isMounted = true;
    const updateCounts = async () => {
      try {
        const [projects, tasks] = await Promise.all([
          projectService.getAllProjects(),
          taskService.getAllTasks(),
        ]);
        if (isMounted) {
          setCounts({
            projects: projects.length,
            tasks: tasks.length,
          });
        }
      } catch {
        // Silently preserve previous counts on transient network error
      }
    };

    updateCounts();
    return () => {
      isMounted = false;
    };
  }, [isAuthenticated, activeView]);

  // Loading state while checking JWT token on initial load
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center text-white space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/30 animate-pulse">
          <Code2 className="w-6 h-6 text-white" />
        </div>
        <p className="text-xs font-semibold text-slate-400 tracking-wider uppercase">
          Initializing DevFlow AI...
        </p>
      </div>
    );
  }

  // Unauthenticated visitors: Show Login / Register
  if (!isAuthenticated) {
    if (authView === "register") {
      return <Register onSwitchToLogin={() => setAuthView("login")} />;
    }
    return <Login onSwitchToRegister={() => setAuthView("register")} />;
  }

  // Authenticated workspace
  const handleNavigate = (view, projectId = null) => {
    if (projectId) {
      setTargetProjectIdForTasks(projectId);
    }
    setActiveView(view);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#0F172A] flex flex-col antialiased selection:bg-blue-100 selection:text-blue-900">
      {/* Sidebar Navigation */}
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        activeView={activeView}
        onSelectView={handleNavigate}
        counts={counts}
      />

      {/* Main Content Area */}
      <div className="lg:pl-64 flex flex-col flex-1 min-w-0 transition-all duration-300">
        {/* Top Navbar */}
        <Navbar
          onToggleSidebar={() => setSidebarOpen(true)}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onClearSearch={() => setSearchQuery("")}
          activeView={activeView}
          onNavigate={handleNavigate}
        />

        {/* Dynamic Main View */}
        <main className="flex-1 pb-16">
          {activeView === "Dashboard" && (
            <Dashboard
              searchQuery={searchQuery}
              onClearSearch={() => setSearchQuery("")}
              onNavigate={handleNavigate}
            />
          )}

          {activeView === "Projects" && (
            <ProjectsView
              onNavigateToTasks={(projectId) => handleNavigate("Tasks", projectId)}
            />
          )}

          {activeView === "Tasks" && (
            <TasksView initialProjectId={targetProjectIdForTasks} />
          )}

          {activeView === "AIAssistant" && (
            <AIAssistantView onNavigateToTasks={() => handleNavigate("Tasks")} />
          )}

          {activeView === "Settings" && <SettingsView />}
        </main>

        {/* Professional Footer */}
        <footer className="border-t border-slate-200/80 bg-white py-4 px-6 text-center text-xs text-slate-500">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
            <div>
              <strong className="text-slate-700">DevFlow AI</strong> • Full Stack Development Platform (Task 4)
            </div>
            <div>
              Engineered by <span className="font-semibold text-slate-800">Aswin Muthaiya</span> • MongoDB Atlas Live
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
