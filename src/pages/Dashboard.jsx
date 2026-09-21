import React, { useState, useMemo, useEffect, useCallback } from "react";
import {
  Plus,
  ArrowRight,
  Sparkles,
  AlertCircle,
  RotateCcw,
} from "lucide-react";
import StatCard from "../components/StatCard";
import ProjectCard from "../components/ProjectCard";
import TaskCard from "../components/TaskCard";
import FilterBar from "../components/FilterBar";
import LoadingState from "../components/LoadingState";
import EmptyState from "../components/EmptyState";
import ErrorState from "../components/ErrorState";
import Modal from "../components/Modal";
import ProgressBar from "../components/ProgressBar";
import projectService from "../services/projectService";
import taskService from "../services/taskService";
import { useAuth } from "../context/AuthContext";

// Normalization helpers for compatibility with Task 1 cards
const normalizeProject = (p) => {
  const id = p._id || p.id;
  return {
    id,
    _id: id,
    name: p.name,
    description: p.description,
    status:
      p.status === "completed"
        ? "Completed"
        : p.status === "archived"
        ? "Archived"
        : "In Progress",
    progress: p.progress || 0,
    category: "Full Stack",
    dueDate: p.createdAt ? new Date(p.createdAt).toLocaleDateString() : "Active",
    tasksCount: 0,
    team: [{ name: p.ownerId?.name || "DevFlow", initials: "DF", bg: "bg-blue-600" }],
  };
};

const normalizeTask = (t) => {
  const id = t._id || t.id;
  const statusMap = {
    todo: "Todo",
    "in-progress": "In Progress",
    done: "Done",
  };
  const priorityMap = {
    low: "Low",
    medium: "Medium",
    high: "High",
  };

  return {
    id,
    _id: id,
    title: t.title,
    description: t.description || "",
    status: statusMap[t.status?.toLowerCase()] || "Todo",
    priority: priorityMap[t.priority?.toLowerCase()] || "Medium",
    projectName: t.projectId?.name || "DevFlow Project",
    projectId: t.projectId?._id || t.projectId?.id || t.projectId,
    dueDate: t.dueDate ? new Date(t.dueDate).toLocaleDateString() : "Active",
    assignee: t.assignedTo?.name || "Team Member",
  };
};

export default function Dashboard({
  searchQuery = "",
  onClearSearch,
  onNavigate,
  onPreloadAIPrompt,
}) {
  const { user } = useAuth();

  // Core application data states from MongoDB API
  const [projects, setProjects] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // Filter states
  const [statusFilter, setStatusFilter] = useState("All");
  const [priorityFilter, setPriorityFilter] = useState("All");

  // Modal states
  const [isNewProjectModalOpen, setIsNewProjectModalOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [selectedTask, setSelectedTask] = useState(null);

  // Quick AI prompt box on dashboard
  const [quickPrompt, setQuickPrompt] = useState("");

  // New Project Form State
  const [newProjectForm, setNewProjectForm] = useState({
    name: "",
    description: "",
    status: "active",
    progress: 0,
  });
  const [formError, setFormError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch real data from MongoDB API
  const fetchDashboardData = useCallback(async () => {
    setIsLoading(true);
    setIsError(false);
    setErrorMessage("");
    try {
      const [projectsRes, tasksRes] = await Promise.all([
        projectService.getAllProjects(),
        taskService.getAllTasks(),
      ]);

      setProjects(projectsRes.map(normalizeProject));
      setTasks(tasksRes.map(normalizeTask));
    } catch (err) {
      setIsError(true);
      setErrorMessage(err.message || "Unable to connect to DevFlow API.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  // Clear all filters & search
  const handleClearAllFilters = () => {
    setStatusFilter("All");
    setPriorityFilter("All");
    if (onClearSearch) onClearSearch();
  };

  // Filter Projects based on search query
  const filteredProjects = useMemo(() => {
    const query = searchQuery.toLowerCase().trim();
    if (!query) return projects;

    return projects.filter((proj) => {
      const matchName = proj.name?.toLowerCase().includes(query);
      const matchDesc = proj.description?.toLowerCase().includes(query);
      return matchName || matchDesc;
    });
  }, [projects, searchQuery]);

  // Filter Tasks based on search query, status filter, and priority filter
  const filteredTasks = useMemo(() => {
    const query = searchQuery.toLowerCase().trim();

    return tasks.filter((task) => {
      if (statusFilter !== "All" && task.status !== statusFilter) {
        return false;
      }
      if (priorityFilter !== "All" && task.priority !== priorityFilter) {
        return false;
      }
      if (query) {
        const matchTitle = task.title?.toLowerCase().includes(query);
        const matchProject = task.projectName?.toLowerCase().includes(query);
        if (!matchTitle && !matchProject) return false;
      }
      return true;
    });
  }, [tasks, searchQuery, statusFilter, priorityFilter]);

  // Dynamic Statistics calculation based on real MongoDB API data
  const dynamicStats = useMemo(() => {
    const totalProjects = projects.length;
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter((t) => t.status === "Done").length;
    const overallProgress =
      projects.length > 0
        ? Math.round(projects.reduce((acc, p) => acc + p.progress, 0) / projects.length)
        : 0;

    return [
      {
        id: "total-projects",
        title: "Total Projects",
        value: totalProjects,
        change: `${totalProjects} active on Atlas`,
        trend: "up",
        icon: "FolderKanban",
        color: "blue",
      },
      {
        id: "total-tasks",
        title: "Total Tasks",
        value: totalTasks,
        change: `${tasks.filter((t) => t.status === "In Progress").length} in progress`,
        trend: "neutral",
        icon: "CheckSquare",
        color: "amber",
      },
      {
        id: "completed-tasks",
        title: "Completed Tasks",
        value: completedTasks,
        change: `${totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0}% velocity`,
        trend: "up",
        icon: "CheckCircle2",
        color: "emerald",
      },
      {
        id: "overall-progress",
        title: "Overall Progress",
        value: `${overallProgress}%`,
        change: "Live MongoDB aggregate",
        trend: "up",
        icon: "TrendingUp",
        color: "indigo",
      },
    ];
  }, [projects, tasks]);

  // Handle task status cycle: Todo -> In Progress -> Done -> Todo
  const handleToggleTaskStatus = async (taskId) => {
    const nextStatusMap = {
      Todo: "in-progress",
      "In Progress": "done",
      Done: "todo",
    };

    const target = tasks.find((t) => t.id === taskId);
    if (!target) return;

    const nextStatus = nextStatusMap[target.status] || "todo";
    const displayNextStatus =
      nextStatus === "in-progress" ? "In Progress" : nextStatus === "done" ? "Done" : "Todo";

    // Optimistic UI update
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, status: displayNextStatus } : t))
    );

    try {
      await taskService.updateTaskStatus(taskId, nextStatus);
    } catch (err) {
      console.error("Failed to update task status in API:", err);
      // Revert if API fails
      fetchDashboardData();
    }
  };

  // Handle New Project submission to MongoDB API
  const handleCreateProject = async (e) => {
    e.preventDefault();
    if (!newProjectForm.name.trim() || newProjectForm.name.trim().length < 2) {
      setFormError("Project name must be at least 2 characters long.");
      return;
    }
    if (!newProjectForm.description.trim() || newProjectForm.description.trim().length < 5) {
      setFormError("Description must be at least 5 characters long.");
      return;
    }

    setIsSubmitting(true);
    setFormError("");
    try {
      const created = await projectService.createProject({
        name: newProjectForm.name.trim(),
        description: newProjectForm.description.trim(),
        status: newProjectForm.status,
        progress: Number(newProjectForm.progress) || 0,
        ownerId: user?.id || user?._id,
      });

      setProjects((prev) => [normalizeProject(created), ...prev]);

      // Reset form & close modal
      setNewProjectForm({
        name: "",
        description: "",
        status: "active",
        progress: 0,
      });
      setIsNewProjectModalOpen(false);
    } catch (err) {
      setFormError(err.message || "Failed to create project in database.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Quick AI launch from Dashboard
  const handleQuickAILaunch = (e) => {
    e.preventDefault();
    if (onPreloadAIPrompt) {
      onPreloadAIPrompt(quickPrompt);
    }
    if (onNavigate) {
      onNavigate("AIAssistant");
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full space-y-8">
      {/* 1. PROFESSIONAL DASHBOARD HEADER */}
      <section className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200/80">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <span>Welcome back, {user?.name || "Developer"}</span>
            <span className="inline-block animate-bounce">👋</span>
          </h2>
          <p className="mt-1 text-xs sm:text-sm text-slate-500 font-medium">
            Here's what's happening across your DevFlow AI workspace and MongoDB Atlas.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={fetchDashboardData}
            className="p-2.5 rounded-xl border border-slate-200 bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors cursor-pointer"
            title="Refresh dashboard data"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={() => setIsNewProjectModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-xs sm:text-sm font-semibold rounded-xl shadow-sm hover:shadow transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>+ New Project</span>
          </button>
        </div>
      </section>

      {/* 2. ERROR STATE VIEW */}
      {isError ? (
        <div className="py-8">
          <ErrorState
            title="Connection Issue"
            message={errorMessage || "Unable to load dashboard data from backend."}
            onRetry={fetchDashboardData}
          />
        </div>
      ) : isLoading ? (
        /* 3. LOADING STATE */
        <LoadingState message="Connecting to MongoDB Atlas & Loading Live Workspace..." />
      ) : (
        /* 4. MAIN CONTENT */
        <>
          {/* STATISTICS METRICS GRID */}
          <section aria-label="Key Productivity Metrics">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              {dynamicStats.map((stat) => (
                <StatCard
                  key={stat.id}
                  title={stat.title}
                  value={stat.value}
                  change={stat.change}
                  trend={stat.trend}
                  icon={stat.icon}
                  color={stat.color}
                />
              ))}
            </div>
          </section>

          {/* AI QUICK ACTION BANNER */}
          <section className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 rounded-3xl p-6 text-white shadow-md relative overflow-hidden">
            <div className="absolute right-0 top-0 -mt-8 -mr-8 w-48 h-48 bg-blue-500/20 rounded-full blur-2xl pointer-events-none" />
            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="space-y-1.5 max-w-xl">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-500/30 text-blue-300 text-[10px] font-bold uppercase tracking-wider">
                  <Sparkles className="w-3 h-3 text-amber-400" />
                  DevFlow AI Assistant
                </div>
                <h3 className="text-lg sm:text-xl font-bold tracking-tight">
                  Instant AI Development Task Synthesis
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Enter a project idea or feature to decompose it into structured engineering tasks.
                </p>
              </div>

              <form
                onSubmit={handleQuickAILaunch}
                className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full md:w-auto"
              >
                <input
                  type="text"
                  value={quickPrompt}
                  onChange={(e) => setQuickPrompt(e.target.value)}
                  placeholder="e.g. Build an e-commerce mobile application..."
                  className="px-4 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700 text-white placeholder-slate-400 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 sm:w-80"
                />
                <button
                  type="submit"
                  className="px-4 py-2.5 rounded-xl bg-blue-500 hover:bg-blue-600 text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer shrink-0"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Generate</span>
                </button>
              </form>
            </div>
          </section>

          {/* Search status indicator */}
          {searchQuery.trim() && (
            <div className="flex items-center justify-between bg-blue-50/70 border border-blue-200 px-4 py-2.5 rounded-xl text-xs sm:text-sm text-blue-900 shadow-2xs">
              <span>
                Filtering view by query: <strong>"{searchQuery}"</strong>
              </span>
              <button
                type="button"
                onClick={onClearSearch}
                className="font-semibold text-blue-600 hover:text-blue-800 underline ml-2 cursor-pointer"
              >
                Clear Search
              </button>
            </div>
          )}

          {/* PROJECTS SECTION */}
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
                  Active Projects
                </h3>
                <p className="text-xs text-slate-500 font-medium">
                  Persisted projects in MongoDB Atlas
                </p>
              </div>
              <button
                type="button"
                onClick={() => onNavigate("Projects")}
                className="text-xs font-bold text-blue-600 hover:text-blue-700 inline-flex items-center gap-1 group cursor-pointer"
              >
                <span>View all ({projects.length})</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
              </button>
            </div>

            {filteredProjects.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                {filteredProjects.slice(0, 4).map((project) => (
                  <ProjectCard
                    key={project.id}
                    project={project}
                    onViewProject={(p) => setSelectedProject(p)}
                  />
                ))}
              </div>
            ) : (
              <EmptyState
                title="No projects yet"
                description="Create your first project or generate one with the AI Task Generator."
                actionLabel="Create Project"
                onAction={() => setIsNewProjectModalOpen(true)}
              />
            )}
          </section>

          {/* RECENT TASKS SECTION */}
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
                  Recent Tasks
                </h3>
                <p className="text-xs text-slate-500 font-medium">
                  Manage sprint tasks, click status circle to advance
                </p>
              </div>
              <button
                type="button"
                onClick={() => onNavigate("Tasks")}
                className="text-xs font-bold text-blue-600 hover:text-blue-700 inline-flex items-center gap-1 group cursor-pointer"
              >
                <span>All tasks ({tasks.length})</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
              </button>
            </div>

            {/* Task Filters */}
            <FilterBar
              statusFilter={statusFilter}
              onStatusChange={setStatusFilter}
              priorityFilter={priorityFilter}
              onPriorityChange={setPriorityFilter}
              onClearAll={handleClearAllFilters}
            />

            {filteredTasks.length > 0 ? (
              <div className="space-y-3">
                {filteredTasks.slice(0, 6).map((task) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    onToggleStatus={handleToggleTaskStatus}
                    onSelectTask={(t) => setSelectedTask(t)}
                  />
                ))}
              </div>
            ) : (
              <EmptyState
                title="No tasks match your filters"
                description="Try clearing your search query or status filter."
                actionLabel="Clear Filters"
                onAction={handleClearAllFilters}
              />
            )}
          </section>
        </>
      )}

      {/* CREATE NEW PROJECT MODAL */}
      <Modal
        isOpen={isNewProjectModalOpen}
        onClose={() => setIsNewProjectModalOpen(false)}
        title="Create New Project"
      >
        <form onSubmit={handleCreateProject} className="space-y-4">
          {formError && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{formError}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Project Name *
            </label>
            <input
              type="text"
              required
              value={newProjectForm.name}
              onChange={(e) =>
                setNewProjectForm({ ...newProjectForm, name: e.target.value })
              }
              placeholder="e.g. NextGen E-Commerce Platform"
              className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Description *
            </label>
            <textarea
              rows={3}
              required
              value={newProjectForm.description}
              onChange={(e) =>
                setNewProjectForm({ ...newProjectForm, description: e.target.value })
              }
              placeholder="Provide a comprehensive summary of project objectives..."
              className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Initial Status
              </label>
              <select
                value={newProjectForm.status}
                onChange={(e) =>
                  setNewProjectForm({ ...newProjectForm, status: e.target.value })
                }
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
              >
                <option value="active">Active</option>
                <option value="completed">Completed</option>
                <option value="archived">Archived</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Initial Progress ({newProjectForm.progress}%)
              </label>
              <input
                type="range"
                min="0"
                max="100"
                value={newProjectForm.progress}
                onChange={(e) =>
                  setNewProjectForm({
                    ...newProjectForm,
                    progress: Number(e.target.value),
                  })
                }
                className="w-full accent-blue-600 mt-2 cursor-pointer"
              />
            </div>
          </div>

          <div className="pt-3 flex justify-end gap-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsNewProjectModalOpen(false)}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? "Creating..." : "Create Project"}
            </button>
          </div>
        </form>
      </Modal>

      {/* PROJECT DETAILS MODAL */}
      <Modal
        isOpen={Boolean(selectedProject)}
        onClose={() => setSelectedProject(null)}
        title={selectedProject?.name || "Project Details"}
      >
        {selectedProject && (
          <div className="space-y-4">
            <p className="text-xs text-slate-600 leading-relaxed">
              {selectedProject.description}
            </p>

            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-semibold text-slate-700">
                <span>Progress</span>
                <span>{selectedProject.progress}%</span>
              </div>
              <ProgressBar progress={selectedProject.progress} />
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2 text-xs">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">
                  Status
                </span>
                <span className="font-semibold text-slate-800">
                  {selectedProject.status}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">
                  Category
                </span>
                <span className="font-semibold text-slate-800">
                  {selectedProject.category}
                </span>
              </div>
            </div>

            <div className="pt-3 flex justify-end">
              <button
                type="button"
                onClick={() => {
                  const pid = selectedProject.id;
                  setSelectedProject(null);
                  if (onNavigate) onNavigate("Tasks", pid);
                }}
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs cursor-pointer"
              >
                View Associated Tasks &rarr;
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* TASK DETAILS MODAL */}
      <Modal
        isOpen={Boolean(selectedTask)}
        onClose={() => setSelectedTask(null)}
        title={selectedTask?.title || "Task Details"}
      >
        {selectedTask && (
          <div className="space-y-4">
            {selectedTask.description && (
              <p className="text-xs text-slate-600 leading-relaxed">
                {selectedTask.description}
              </p>
            )}

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">
                  Project
                </span>
                <span className="font-semibold text-slate-800">
                  {selectedTask.projectName}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">
                  Priority
                </span>
                <span className="font-semibold text-slate-800">
                  {selectedTask.priority}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">
                  Status
                </span>
                <span className="font-semibold text-slate-800">
                  {selectedTask.status}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">
                  Assignee
                </span>
                <span className="font-semibold text-slate-800">
                  {selectedTask.assignee}
                </span>
              </div>
            </div>

            <div className="pt-3 flex justify-end">
              <button
                type="button"
                onClick={() => {
                  handleToggleTaskStatus(selectedTask.id);
                  setSelectedTask(null);
                }}
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs cursor-pointer"
              >
                Advance Status &rarr;
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
