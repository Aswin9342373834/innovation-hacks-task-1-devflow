import React, { useState, useMemo, useRef, useEffect } from "react";
import { Plus, ArrowRight, AlertCircle } from "lucide-react";
import StatCard from "../components/StatCard";
import ProjectCard from "../components/ProjectCard";
import TaskCard from "../components/TaskCard";
import FilterBar from "../components/FilterBar";
import ActivityItem from "../components/ActivityItem";
import LoadingState from "../components/LoadingState";
import EmptyState from "../components/EmptyState";
import ErrorState from "../components/ErrorState";
import Modal from "../components/Modal";
import ProgressBar from "../components/ProgressBar";
import {
  initialProjects,
  initialTasks,
  initialActivities,
  currentUser,
} from "../data/mockData";

export default function Dashboard({
  searchQuery = "",
  onClearSearch,
  activeView = "Dashboard",
  onNavigate,
}) {
  // Core application data states
  const [projects, setProjects] = useState(initialProjects);
  const [tasks, setTasks] = useState(initialTasks);
  const [activities, setActivities] = useState(initialActivities);

  // Filter states
  const [statusFilter, setStatusFilter] = useState("All");
  const [priorityFilter, setPriorityFilter] = useState("All");

  // State inspection / demo toggles for Loading and Error verification
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);

  // Loading timer reference to avoid stuck loading states
  const loadingTimerRef = useRef(null);

  useEffect(() => {
    return () => {
      if (loadingTimerRef.current) {
        clearTimeout(loadingTimerRef.current);
      }
    };
  }, []);

  // Modal states
  const [isNewProjectModalOpen, setIsNewProjectModalOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [selectedTask, setSelectedTask] = useState(null);

  // New Project Form State
  const [newProjectForm, setNewProjectForm] = useState({
    name: "",
    description: "",
    category: "Web Dev",
    dueDate: "Nov 30",
  });
  const [formError, setFormError] = useState("");

  // Clear all filters & search
  const handleClearAllFilters = () => {
    setStatusFilter("All");
    setPriorityFilter("All");
    if (onClearSearch) onClearSearch();
  };

  const hasActiveFilters =
    statusFilter !== "All" || priorityFilter !== "All" || Boolean(searchQuery.trim());

  // Filter Projects based on search query
  const filteredProjects = useMemo(() => {
    const query = searchQuery.toLowerCase().trim();
    if (!query) return projects;

    return projects.filter((proj) => {
      const matchName = proj.name.toLowerCase().includes(query);
      const matchDesc = proj.description.toLowerCase().includes(query);
      const matchCategory = proj.category.toLowerCase().includes(query);
      return matchName || matchDesc || matchCategory;
    });
  }, [projects, searchQuery]);

  // Filter Tasks based on search query, status filter, and priority filter
  const filteredTasks = useMemo(() => {
    const query = searchQuery.toLowerCase().trim();

    return tasks.filter((task) => {
      // Status filter
      if (statusFilter !== "All" && task.status !== statusFilter) {
        return false;
      }
      // Priority filter
      if (priorityFilter !== "All" && task.priority !== priorityFilter) {
        return false;
      }
      // Search query (Task title OR associated project name)
      if (query) {
        const matchTitle = task.title.toLowerCase().includes(query);
        const matchProject = task.projectName.toLowerCase().includes(query);
        if (!matchTitle && !matchProject) return false;
      }
      return true;
    });
  }, [tasks, searchQuery, statusFilter, priorityFilter]);

  // Dynamic Statistics calculation based on live state
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
        change: "+2 this month",
        trend: "up",
        icon: "FolderKanban",
        color: "blue",
      },
      {
        id: "total-tasks",
        title: "Total Tasks",
        value: totalTasks,
        change: `${totalProjects} active projects`,
        trend: "neutral",
        icon: "CheckSquare",
        color: "amber",
      },
      {
        id: "completed-tasks",
        title: "Completed Tasks",
        value: completedTasks,
        change: `${totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0}% completion`,
        trend: "up",
        icon: "CheckCircle2",
        color: "emerald",
      },
      {
        id: "overall-progress",
        title: "Overall Progress",
        value: `${overallProgress}%`,
        change: "+8% this week",
        trend: "up",
        icon: "TrendingUp",
        color: "indigo",
      },
    ];
  }, [projects, tasks]);

  // Handle task status cycle: Todo -> In Progress -> Done -> Todo
  const handleToggleTaskStatus = (taskId) => {
    const nextStatusMap = {
      Todo: "In Progress",
      "In Progress": "Done",
      Done: "Todo",
    };

    let updatedTaskTitle = "";
    let nextStatus = "";

    setTasks((prev) =>
      prev.map((t) => {
        if (t.id === taskId) {
          nextStatus = nextStatusMap[t.status] || "Todo";
          updatedTaskTitle = t.title;
          return { ...t, status: nextStatus };
        }
        return t;
      })
    );

    // Record activity
    if (updatedTaskTitle) {
      const newActivity = {
        id: `act-${Date.now()}`,
        type: nextStatus === "Done" ? "task_complete" : "task_update",
        title: nextStatus === "Done" ? "Task completed" : "Task status updated",
        description: `Task "${updatedTaskTitle}" moved to ${nextStatus}`,
        timestamp: "Just now",
        icon: nextStatus === "Done" ? "CheckCircle2" : "Clock",
        iconColor:
          nextStatus === "Done"
            ? "text-emerald-600 bg-emerald-50 border-emerald-200"
            : "text-blue-600 bg-blue-50 border-blue-200",
      };
      setActivities((prev) => [newActivity, ...prev]);
    }
  };

  // Handle New Project submission
  const handleCreateProject = (e) => {
    e.preventDefault();
    if (!newProjectForm.name.trim()) {
      setFormError("Project name is required.");
      return;
    }

    const createdProject = {
      id: `proj-${Date.now()}`,
      name: newProjectForm.name.trim(),
      description:
        newProjectForm.description.trim() ||
        "Productivity enhancement project managed in DevFlow.",
      status: "In Progress",
      progress: 0,
      tasksCount: 0,
      completedTasksCount: 0,
      dueDate: newProjectForm.dueDate || "Dec 15",
      category: newProjectForm.category || "General",
      team: [{ name: currentUser.name, initials: currentUser.avatar, bg: "bg-blue-600" }],
    };

    setProjects((prev) => [createdProject, ...prev]);

    // Record activity
    setActivities((prev) => [
      {
        id: `act-${Date.now()}`,
        type: "project_create",
        title: "New project",
        description: `New project "${createdProject.name}" created`,
        timestamp: "Just now",
        icon: "FolderPlus",
        iconColor: "text-blue-600 bg-blue-50 border-blue-200",
      },
      ...prev,
    ]);

    // Reset & close modal
    setNewProjectForm({
      name: "",
      description: "",
      category: "Web Dev",
      dueDate: "Nov 30",
    });
    setFormError("");
    setIsNewProjectModalOpen(false);
  };

  // Safe simulated loading trigger with timeout cleanup
  const triggerSimulatedLoading = () => {
    if (loadingTimerRef.current) {
      clearTimeout(loadingTimerRef.current);
    }
    setIsError(false);
    setIsLoading(true);
    loadingTimerRef.current = setTimeout(() => {
      setIsLoading(false);
      loadingTimerRef.current = null;
    }, 1000);
  };

  // Safe simulated error trigger
  const triggerSimulatedError = () => {
    if (loadingTimerRef.current) {
      clearTimeout(loadingTimerRef.current);
      loadingTimerRef.current = null;
    }
    setIsLoading(false);
    setIsError(true);
  };

  // Explicit Retry Handler that cleanly resets the error state and restores dashboard
  const handleRetry = () => {
    if (loadingTimerRef.current) {
      clearTimeout(loadingTimerRef.current);
      loadingTimerRef.current = null;
    }
    setIsLoading(false);
    setIsError(false);
  };

  // Internal state accessibility for testing/evaluation
  useEffect(() => {
    if (typeof window !== "undefined") {
      window.__devflow = {
        simulateLoading: triggerSimulatedLoading,
        simulateError: triggerSimulatedError,
        resetError: handleRetry,
        get state() {
          return { isLoading, isError };
        },
      };
    }
    return () => {
      if (typeof window !== "undefined") {
        delete window.__devflow;
      }
    };
  }, [isLoading, isError]);

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full space-y-8">
      {/* 1. PROFESSIONAL DASHBOARD HEADER */}
      <section className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200/80">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <span>Good morning, Aswin</span>
            <span className="inline-block animate-bounce">👋</span>
          </h2>
          <p className="mt-1 text-xs sm:text-sm text-slate-500 font-medium">
            Here's what's happening with your projects today.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Primary Action Button */}
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

      {/* 2. ERROR STATE VIEW (When Simulate Error is active) */}
      {isError ? (
        <div className="py-8">
          <ErrorState
            title="Something went wrong"
            message="Unable to load dashboard data."
            onRetry={handleRetry}
          />
        </div>
      ) : isLoading ? (
        /* 3. LOADING SKELETON STATE (When Simulate Loading is active) */
        <LoadingState />
      ) : (
        /* 4. NORMAL COMPLETE DASHBOARD CONTENT */
        <>
          {/* STATISTICS SECTION (Rendered on Dashboard and Analytics views) */}
          {(activeView === "Dashboard" || activeView === "Analytics") && (
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
          )}

          {/* Search status indicator when search is active */}
          {searchQuery.trim() && (
            <div className="flex items-center justify-between bg-blue-50/70 border border-blue-200 px-4 py-2.5 rounded-xl text-xs sm:text-sm text-blue-900 shadow-2xs">
              <span>
                Filtering all views by query: <strong>"{searchQuery}"</strong>
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

          {/* MAIN CONTENT BASED ON ACTIVE SIDEBAR VIEW */}
          {/* VIEW: DASHBOARD (Overview) */}
          {activeView === "Dashboard" && (
            <div className="space-y-8">
              {/* Projects Section */}
              <section className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
                      Projects
                    </h3>
                    <p className="text-xs text-slate-500 font-medium">
                      Active workspaces and milestones
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
                    title="No results found"
                    message="Try changing your search or filters."
                    onClearFilters={handleClearAllFilters}
                  />
                )}
              </section>

              {/* Grid Layout: Tasks (Left 2 cols) & Recent Activity (Right 1 col) */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8 items-start">
                {/* Left 2 Cols: Recent Tasks */}
                <section className="lg:col-span-2 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
                        Recent Tasks
                      </h3>
                      <p className="text-xs text-slate-500 font-medium">
                        Manage sprint items, priorities, and status
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
                    onClearFilters={handleClearAllFilters}
                    hasActiveFilters={hasActiveFilters}
                    totalResultsCount={filteredTasks.length}
                  />

                  {/* Task Cards List */}
                  {filteredTasks.length > 0 ? (
                    <div className="space-y-2.5">
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
                      title="No results found"
                      message="Try changing your search or filters."
                      onClearFilters={handleClearAllFilters}
                    />
                  )}
                </section>

                {/* Right 1 Col: Recent Activity */}
                <section className="bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-sm space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                    <h3 className="text-sm sm:text-base font-bold text-slate-900 tracking-tight">
                      Recent Activity
                    </h3>
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                      Live Feed
                    </span>
                  </div>

                  <div className="divide-y divide-slate-100">
                    {activities.slice(0, 6).map((activity, index) => (
                      <ActivityItem
                        key={activity.id}
                        activity={activity}
                        isLast={index === Math.min(5, activities.length - 1)}
                      />
                    ))}
                  </div>
                </section>
              </div>
            </div>
          )}

          {/* VIEW: PROJECTS (Focused Projects Gallery) */}
          {activeView === "Projects" && (
            <section className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
                <div>
                  <h3 className="text-lg font-bold text-slate-900 tracking-tight">
                    All Projects ({filteredProjects.length})
                  </h3>
                  <p className="text-xs text-slate-500 font-medium">
                    Complete overview of engineering initiatives
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsNewProjectModalOpen(true)}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl shadow-sm cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Project</span>
                </button>
              </div>

              {filteredProjects.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {filteredProjects.map((project) => (
                    <ProjectCard
                      key={project.id}
                      project={project}
                      onViewProject={(p) => setSelectedProject(p)}
                    />
                  ))}
                </div>
              ) : (
                <EmptyState
                  title="No results found"
                  message="Try changing your search or filters."
                  onClearFilters={handleClearAllFilters}
                />
              )}
            </section>
          )}

          {/* VIEW: TASKS (Focused Task Management View) */}
          {activeView === "Tasks" && (
            <section className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
                <div>
                  <h3 className="text-lg font-bold text-slate-900 tracking-tight">
                    Task Management ({filteredTasks.length})
                  </h3>
                  <p className="text-xs text-slate-500 font-medium">
                    Filter by status, priority, or search term
                  </p>
                </div>
              </div>

              {/* Filter controls */}
              <FilterBar
                statusFilter={statusFilter}
                onStatusChange={setStatusFilter}
                priorityFilter={priorityFilter}
                onPriorityChange={setPriorityFilter}
                onClearFilters={handleClearAllFilters}
                hasActiveFilters={hasActiveFilters}
                totalResultsCount={filteredTasks.length}
              />

              {filteredTasks.length > 0 ? (
                <div className="space-y-3">
                  {filteredTasks.map((task) => (
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
                  title="No results found"
                  message="Try changing your search or filters."
                  onClearFilters={handleClearAllFilters}
                />
              )}
            </section>
          )}

          {/* VIEW: ANALYTICS (Developer Insights & Metrics) */}
          {activeView === "Analytics" && (
            <section className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {/* Git Velocity */}
                <div className="bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-sm space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                      Git Velocity
                    </span>
                    <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-semibold border border-emerald-200/60">
                      High Impact
                    </span>
                  </div>
                  <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                    {currentUser.metrics.commitsThisWeek} commits
                  </div>
                  <p className="text-xs text-slate-500 leading-relaxed font-medium">
                    14 Pull Requests merged across 5 repositories this sprint.
                  </p>
                  <ProgressBar progress={84} size="sm" showLabel />
                </div>

                {/* Code Quality & Reviews */}
                <div className="bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-sm space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                      Code Reviews
                    </span>
                    <span className="text-xs px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 font-semibold border border-blue-200/60">
                      Active
                    </span>
                  </div>
                  <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                    {currentUser.metrics.codeReviews} reviewed
                  </div>
                  <p className="text-xs text-slate-500 leading-relaxed font-medium">
                    Average turnaround time: 1.4 hours per review.
                  </p>
                  <ProgressBar progress={92} size="sm" showLabel />
                </div>

                {/* Sprint Completion Rate */}
                <div className="bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-sm space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                      Sprint Completion
                    </span>
                    <span className="text-xs px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 font-semibold border border-indigo-200/60">
                      On Track
                    </span>
                  </div>
                  <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                    72%
                  </div>
                  <p className="text-xs text-slate-500 leading-relaxed font-medium">
                    16 of 24 sprint tasks completed before sprint freeze.
                  </p>
                  <ProgressBar progress={72} size="sm" showLabel />
                </div>
              </div>

              {/* Complete Activity Log */}
              <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <h3 className="text-base font-bold text-slate-900 tracking-tight">
                    Complete Engineering Activity Log
                  </h3>
                  <span className="text-xs text-slate-400 font-medium">
                    {activities.length} Recorded Events
                  </span>
                </div>
                <div className="divide-y divide-slate-100">
                  {activities.map((act, i) => (
                    <ActivityItem
                      key={act.id}
                      activity={act}
                      isLast={i === activities.length - 1}
                    />
                  ))}
                </div>
              </div>
            </section>
          )}

          {/* VIEW: SETTINGS (Preferences & Profile View) */}
          {activeView === "Settings" && (
            <section className="max-w-3xl space-y-6">
              <div className="bg-white rounded-2xl border border-slate-200/80 p-6 sm:p-8 shadow-sm space-y-6">
                <div className="border-b border-slate-100 pb-4">
                  <h3 className="text-lg font-bold text-slate-900 tracking-tight">
                    Developer Profile
                  </h3>
                  <p className="text-xs text-slate-500 font-medium">
                    Personal identity and developer workspace preferences
                  </p>
                </div>

                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-blue-600 text-white font-extrabold flex items-center justify-center text-lg shadow-md shadow-blue-500/20">
                    {currentUser.avatar}
                  </div>
                  <div>
                    <h4 className="text-base font-bold text-slate-900">
                      {currentUser.name}
                    </h4>
                    <p className="text-xs text-slate-500 font-medium">{currentUser.email}</p>
                    <span className="inline-block mt-1 text-[11px] font-bold text-blue-600 bg-blue-50 px-2.5 py-0.5 rounded-md border border-blue-100">
                      {currentUser.role} • Innovation Hacks Internship
                    </span>
                  </div>
                </div>

                <div className="space-y-5 pt-2">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      Bio / Focus
                    </label>
                    <p className="text-xs sm:text-sm text-slate-600 bg-slate-50 p-4 rounded-xl border border-slate-200/80 leading-relaxed font-medium">
                      {currentUser.bio}
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                        Default Project View
                      </label>
                      <select
                        className="w-full text-xs sm:text-sm bg-slate-50 border border-slate-200/80 rounded-xl p-3 text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                        defaultValue="Grid"
                      >
                        <option value="Grid">Grid Cards (Default)</option>
                        <option value="List">Condensed List</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                        Notification Frequency
                      </label>
                      <select
                        className="w-full text-xs sm:text-sm bg-slate-50 border border-slate-200/80 rounded-xl p-3 text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                        defaultValue="Realtime"
                      >
                        <option value="Realtime">Real-time alerts</option>
                        <option value="Daily">Daily summary</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          )}
        </>
      )}

      {/* 5. MODALS */}
      {/* Modal: + New Project */}
      <Modal
        isOpen={isNewProjectModalOpen}
        onClose={() => setIsNewProjectModalOpen(false)}
        title="Create New Project"
      >
        <form onSubmit={handleCreateProject} className="space-y-4">
          {formError && (
            <div className="p-3 bg-rose-50 text-rose-700 text-xs rounded-xl border border-rose-200 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
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
              placeholder="e.g. NextGen Microservices"
              className="w-full text-xs sm:text-sm px-3.5 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Category
            </label>
            <select
              value={newProjectForm.category}
              onChange={(e) =>
                setNewProjectForm({ ...newProjectForm, category: e.target.value })
              }
              className="w-full text-xs sm:text-sm px-3.5 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white"
            >
              <option value="Web Dev">Web Dev</option>
              <option value="Mobile">Mobile</option>
              <option value="AI / ML">AI / ML</option>
              <option value="DevOps">DevOps</option>
              <option value="Design System">Design System</option>
              <option value="Backend">Backend</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Due Date
            </label>
            <input
              type="text"
              value={newProjectForm.dueDate}
              onChange={(e) =>
                setNewProjectForm({ ...newProjectForm, dueDate: e.target.value })
              }
              placeholder="e.g. Nov 30"
              className="w-full text-xs sm:text-sm px-3.5 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Description
            </label>
            <textarea
              rows={3}
              value={newProjectForm.description}
              onChange={(e) =>
                setNewProjectForm({
                  ...newProjectForm,
                  description: e.target.value,
                })
              }
              placeholder="Describe the goals and key deliverables of this project..."
              className="w-full text-xs sm:text-sm px-3.5 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 resize-none"
            />
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={() => setIsNewProjectModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-sm transition-colors cursor-pointer"
            >
              Create Project
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal: View Project Details */}
      {selectedProject && (
        <Modal
          isOpen={Boolean(selectedProject)}
          onClose={() => setSelectedProject(null)}
          title={selectedProject.name}
          maxWidth="max-w-lg"
        >
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase font-bold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-md border border-blue-100">
                {selectedProject.category}
              </span>
              <span className="text-xs font-semibold text-slate-500">
                Due: {selectedProject.dueDate}
              </span>
            </div>

            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-medium">
              {selectedProject.description}
            </p>

            <div className="bg-slate-50/90 p-4 rounded-xl border border-slate-200/80 space-y-3">
              <div className="flex items-center justify-between text-xs font-medium">
                <span className="text-slate-500 font-semibold">Milestone Progress</span>
                <span className="text-slate-900 font-extrabold">
                  {selectedProject.progress}%
                </span>
              </div>
              <ProgressBar progress={selectedProject.progress} size="md" />

              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-200/80 text-xs text-slate-600">
                <div>
                  <span className="text-slate-400 block text-[11px] font-medium">Tasks</span>
                  <span className="font-bold text-slate-800">
                    {selectedProject.tasksCount} total
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px] font-medium">Status</span>
                  <span className="font-bold text-slate-800">
                    {selectedProject.status}
                  </span>
                </div>
              </div>
            </div>

            {selectedProject.team && selectedProject.team.length > 0 && (
              <div>
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Project Contributors
                </h4>
                <div className="flex flex-wrap gap-2">
                  {selectedProject.team.map((member, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-2 bg-white px-3 py-1 rounded-xl border border-slate-200 text-xs shadow-2xs"
                    >
                      <span
                        className={`w-5 h-5 rounded-full text-[10px] text-white font-bold flex items-center justify-center ${
                          member.bg || "bg-blue-600"
                        }`}
                      >
                        {member.initials}
                      </span>
                      <span className="font-semibold text-slate-800">
                        {member.name}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="pt-4 border-t border-slate-100 flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedProject(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Modal: View Task Details */}
      {selectedTask && (
        <Modal
          isOpen={Boolean(selectedTask)}
          onClose={() => setSelectedTask(null)}
          title="Task Details"
        >
          <div className="space-y-4">
            <div>
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                {selectedTask.projectName}
              </span>
              <h4 className="text-base font-bold text-slate-900 mt-1">
                {selectedTask.title}
              </h4>
            </div>

            <div className="grid grid-cols-2 gap-3 bg-slate-50/90 p-4 rounded-xl border border-slate-200 text-xs">
              <div>
                <span className="text-slate-400 block text-[11px] font-medium">Current Status</span>
                <span className="font-bold text-slate-800">
                  {selectedTask.status}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px] font-medium">Priority</span>
                <span className="font-bold text-slate-800">
                  {selectedTask.priority}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px] font-medium">Due Date</span>
                <span className="font-bold text-slate-800">
                  {selectedTask.dueDate}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px] font-medium">Assignee</span>
                <span className="font-bold text-slate-800">
                  {selectedTask.assignee?.name || "Unassigned"}
                </span>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
              <button
                type="button"
                onClick={() => {
                  handleToggleTaskStatus(selectedTask.id);
                  setSelectedTask((prev) => ({
                    ...prev,
                    status:
                      prev.status === "Todo"
                        ? "In Progress"
                        : prev.status === "In Progress"
                        ? "Done"
                        : "Todo",
                  }));
                }}
                className="px-3.5 py-1.5 text-xs font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-xl transition-colors cursor-pointer"
              >
                Cycle Status (Toggle)
              </button>

              <button
                type="button"
                onClick={() => setSelectedTask(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
