import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  CheckSquare,
  Plus,
  Search,
  Filter,
  Calendar,
  FolderKanban,
  Edit2,
  Trash2,
  CheckCircle2,
  Clock,
  Circle,
  AlertCircle,
  Kanban,
  List,
} from 'lucide-react';
import taskService from '../services/taskService';
import projectService from '../services/projectService';
import Modal from '../components/Modal';
import LoadingState from '../components/LoadingState';
import EmptyState from '../components/EmptyState';
import ErrorState from '../components/ErrorState';

export default function TasksView({ initialProjectId = null }) {
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [priorityFilter, setPriorityFilter] = useState('All');
  const [selectedProjectId, setSelectedProjectId] = useState(initialProjectId || 'All');
  const [viewMode, setViewMode] = useState('kanban'); // 'kanban' | 'list'

  // Modals
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  // Active Task
  const [currentTask, setCurrentTask] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    projectId: '',
    priority: 'medium',
    status: 'todo',
    dueDate: '',
  });
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Load projects and tasks
  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [projectsData, tasksData] = await Promise.all([
        projectService.getAllProjects(),
        taskService.getAllTasks(),
      ]);
      setProjects(projectsData);
      setTasks(tasksData);
    } catch (err) {
      setError(err.message || 'Failed to load tasks from server.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // If initialProjectId changed from outside
  useEffect(() => {
    if (initialProjectId) {
      setSelectedProjectId(initialProjectId);
    }
  }, [initialProjectId]);

  // Filtered tasks
  const filteredTasks = useMemo(() => {
    return tasks.filter((t) => {
      // Search
      const query = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !query ||
        t.title?.toLowerCase().includes(query) ||
        t.description?.toLowerCase().includes(query);

      // Status
      const taskStatusNorm = t.status?.toLowerCase().replace(/\s+/g, '-');
      const filterStatusNorm = statusFilter.toLowerCase().replace(/\s+/g, '-');
      const matchesStatus = statusFilter === 'All' || taskStatusNorm === filterStatusNorm;

      // Priority
      const matchesPriority =
        priorityFilter === 'All' || t.priority?.toLowerCase() === priorityFilter.toLowerCase();

      // Project
      const taskProjectId =
        t.projectId?._id || t.projectId?.id || (typeof t.projectId === 'string' ? t.projectId : '');
      const matchesProject =
        selectedProjectId === 'All' || taskProjectId === selectedProjectId;

      return matchesSearch && matchesStatus && matchesPriority && matchesProject;
    });
  }, [tasks, searchQuery, statusFilter, priorityFilter, selectedProjectId]);

  // Quick toggle task status: todo -> in-progress -> done -> todo
  const handleCycleStatus = async (task) => {
    const id = task._id || task.id;
    const currentStatus = (task.status || 'todo').toLowerCase().replace(/\s+/g, '-');

    const nextStatusMap = {
      todo: 'in-progress',
      'in-progress': 'done',
      done: 'todo',
    };

    const nextStatus = nextStatusMap[currentStatus] || 'todo';

    try {
      // Optimistic update
      setTasks((prev) =>
        prev.map((t) => ((t._id || t.id) === id ? { ...t, status: nextStatus } : t))
      );
      await taskService.updateTaskStatus(id, nextStatus);
    } catch (err) {
      console.error('Failed to update status:', err);
      // Revert on error
      fetchData();
    }
  };

  // Open Create Task Modal
  const handleOpenCreate = () => {
    setFormData({
      title: '',
      description: '',
      projectId:
        selectedProjectId !== 'All'
          ? selectedProjectId
          : projects.length > 0
          ? projects[0]._id || projects[0].id
          : '',
      priority: 'medium',
      status: 'todo',
      dueDate: '',
    });
    setFormError('');
    setIsCreateModalOpen(true);
  };

  // Submit Create Task
  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim() || formData.title.trim().length < 2) {
      setFormError('Title must be at least 2 characters.');
      return;
    }
    if (!formData.projectId) {
      setFormError('Please select an associated project.');
      return;
    }

    setSubmitting(true);
    setFormError('');
    try {
      const newTask = await taskService.createTask({
        title: formData.title.trim(),
        description: formData.description.trim(),
        projectId: formData.projectId,
        priority: formData.priority,
        status: formData.status,
        dueDate: formData.dueDate ? new Date(formData.dueDate) : null,
      });

      setTasks((prev) => [newTask, ...prev]);
      setIsCreateModalOpen(false);
    } catch (err) {
      setFormError(err.message || 'Failed to create task.');
    } finally {
      setSubmitting(false);
    }
  };

  // Open Edit Task Modal
  const handleOpenEdit = (task) => {
    setCurrentTask(task);
    const projId =
      task.projectId?._id ||
      task.projectId?.id ||
      (typeof task.projectId === 'string' ? task.projectId : '');

    setFormData({
      title: task.title || '',
      description: task.description || '',
      projectId: projId || (projects[0]?._id || projects[0]?.id || ''),
      priority: task.priority || 'medium',
      status: task.status || 'todo',
      dueDate: task.dueDate ? new Date(task.dueDate).toISOString().slice(0, 10) : '',
    });
    setFormError('');
    setIsEditModalOpen(true);
  };

  // Submit Edit Task
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim() || formData.title.trim().length < 2) {
      setFormError('Title must be at least 2 characters.');
      return;
    }

    setSubmitting(true);
    setFormError('');
    try {
      const id = currentTask._id || currentTask.id;
      const updated = await taskService.updateTask(id, {
        title: formData.title.trim(),
        description: formData.description.trim(),
        projectId: formData.projectId,
        priority: formData.priority,
        status: formData.status,
        dueDate: formData.dueDate ? new Date(formData.dueDate) : null,
      });

      setTasks((prev) =>
        prev.map((t) => ((t._id || t.id) === id ? { ...t, ...updated } : t))
      );
      setIsEditModalOpen(false);
    } catch (err) {
      setFormError(err.message || 'Failed to update task.');
    } finally {
      setSubmitting(false);
    }
  };

  // Open Delete Modal
  const handleOpenDelete = (task) => {
    setCurrentTask(task);
    setIsDeleteModalOpen(true);
  };

  // Confirm Delete Task
  const handleDeleteConfirm = async () => {
    if (!currentTask) return;
    const id = currentTask._id || currentTask.id;

    setSubmitting(true);
    try {
      await taskService.deleteTask(id);
      setTasks((prev) => prev.filter((t) => (t._id || t.id) !== id));
      setIsDeleteModalOpen(false);
    } catch (err) {
      alert(err.message || 'Failed to delete task.');
    } finally {
      setSubmitting(false);
    }
  };

  // Kanban Column Tasks
  const kanbanColumns = useMemo(() => {
    return [
      {
        id: 'todo',
        label: 'To Do',
        color: 'slate',
        tasks: filteredTasks.filter((t) => (t.status || 'todo').toLowerCase() === 'todo'),
      },
      {
        id: 'in-progress',
        label: 'In Progress',
        color: 'blue',
        tasks: filteredTasks.filter((t) => (t.status || '').toLowerCase() === 'in-progress'),
      },
      {
        id: 'done',
        label: 'Done',
        color: 'emerald',
        tasks: filteredTasks.filter((t) => (t.status || '').toLowerCase() === 'done'),
      },
    ];
  }, [filteredTasks]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
            <CheckSquare className="w-7 h-7 text-blue-600" />
            Task Management
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Organize, prioritize, and track development tasks connected to your MongoDB projects
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* View Toggle */}
          <div className="bg-slate-100 p-1 rounded-xl flex items-center gap-1 border border-slate-200">
            <button
              type="button"
              onClick={() => setViewMode('kanban')}
              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                viewMode === 'kanban' ? 'bg-white text-blue-600 shadow-2xs' : 'text-slate-500'
              }`}
              title="Kanban Board View"
            >
              <Kanban className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                viewMode === 'list' ? 'bg-white text-blue-600 shadow-2xs' : 'text-slate-500'
              }`}
              title="List View"
            >
              <List className="w-4 h-4" />
            </button>
          </div>

          <button
            type="button"
            onClick={handleOpenCreate}
            disabled={projects.length === 0}
            className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-500/20 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
          >
            <Plus className="w-4 h-4" />
            New Task
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-2xs space-y-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Search */}
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search tasks..."
              className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
            />
          </div>

          {/* Project & Priority Selectors */}
          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
            {/* Project Filter */}
            <div className="flex items-center gap-1.5">
              <FolderKanban className="w-4 h-4 text-slate-400" />
              <select
                value={selectedProjectId}
                onChange={(e) => setSelectedProjectId(e.target.value)}
                className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-medium text-slate-700 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
              >
                <option value="All">All Projects</option>
                {projects.map((p) => (
                  <option key={p._id || p.id} value={p._id || p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Priority Filter */}
            <div className="flex items-center gap-1.5">
              <Filter className="w-4 h-4 text-slate-400" />
              <select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
                className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-medium text-slate-700 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
              >
                <option value="All">All Priorities</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>
          </div>
        </div>

        {/* Status Pills */}
        <div className="flex items-center gap-2 pt-1 border-t border-slate-100 overflow-x-auto pb-1">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mr-1">
            Status:
          </span>
          {['All', 'Todo', 'In Progress', 'Done'].map((status) => (
            <button
              key={status}
              type="button"
              onClick={() => setStatusFilter(status)}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                statusFilter === status
                  ? 'bg-blue-600 text-white shadow-2xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content Area */}
      {loading ? (
        <LoadingState message="Fetching tasks from MongoDB..." />
      ) : error ? (
        <ErrorState message={error} onRetry={fetchData} />
      ) : filteredTasks.length === 0 ? (
        <EmptyState
          title="No Tasks Found"
          description={
            searchQuery || statusFilter !== 'All' || priorityFilter !== 'All'
              ? 'No tasks match your filter criteria. Try adjusting filters or search.'
              : 'You have no tasks created yet. Create one or generate tasks with AI.'
          }
          actionLabel={projects.length > 0 ? 'Create Task' : undefined}
          onAction={projects.length > 0 ? handleOpenCreate : undefined}
        />
      ) : viewMode === 'kanban' ? (
        /* KANBAN BOARD VIEW */
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
          {kanbanColumns.map((col) => (
            <div
              key={col.id}
              className="bg-slate-100/70 rounded-3xl p-4 border border-slate-200/80 space-y-3 min-h-[400px]"
            >
              {/* Column Header */}
              <div className="flex items-center justify-between px-2 py-1">
                <div className="flex items-center gap-2">
                  <span
                    className={`w-2.5 h-2.5 rounded-full ${
                      col.id === 'done'
                        ? 'bg-emerald-500'
                        : col.id === 'in-progress'
                        ? 'bg-blue-500'
                        : 'bg-slate-400'
                    }`}
                  />
                  <h3 className="font-bold text-slate-800 text-sm">{col.label}</h3>
                </div>
                <span className="text-xs font-bold text-slate-500 bg-white px-2 py-0.5 rounded-full border border-slate-200">
                  {col.tasks.length}
                </span>
              </div>

              {/* Tasks in Column */}
              <div className="space-y-3">
                {col.tasks.map((task) => {
                  const id = task._id || task.id;
                  const projectName = task.projectId?.name || 'Project';

                  return (
                    <div
                      key={id}
                      className="bg-white rounded-2xl p-4 border border-slate-200 shadow-2xs hover:shadow-md transition-all space-y-3 group"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider truncate max-w-[140px]">
                          {projectName}
                        </span>

                        <span
                          className={`text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full ${
                            task.priority === 'high'
                              ? 'bg-rose-100 text-rose-700'
                              : task.priority === 'medium'
                              ? 'bg-amber-100 text-amber-700'
                              : 'bg-emerald-100 text-emerald-700'
                          }`}
                        >
                          {task.priority}
                        </span>
                      </div>

                      <h4 className="font-bold text-slate-900 text-xs leading-snug">
                        {task.title}
                      </h4>

                      {task.description && (
                        <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed">
                          {task.description}
                        </p>
                      )}

                      <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                        {/* Status Cycle Button */}
                        <button
                          type="button"
                          onClick={() => handleCycleStatus(task)}
                          className="text-[11px] font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 cursor-pointer"
                          title="Click to advance status"
                        >
                          <Circle className="w-3 h-3 text-blue-500" />
                          <span>Move &rarr;</span>
                        </button>

                        <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100">
                          <button
                            type="button"
                            onClick={() => handleOpenEdit(task)}
                            className="p-1 rounded text-slate-400 hover:text-indigo-600 hover:bg-slate-100 transition-colors cursor-pointer"
                            title="Edit"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleOpenDelete(task)}
                            className="p-1 rounded text-slate-400 hover:text-rose-600 hover:bg-slate-100 transition-colors cursor-pointer"
                            title="Delete"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}

                {col.tasks.length === 0 && (
                  <div className="py-8 text-center text-xs text-slate-400 italic">
                    No tasks in {col.label}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* LIST VIEW */
        <div className="bg-white rounded-3xl border border-slate-200/80 overflow-hidden shadow-2xs divide-y divide-slate-100">
          {filteredTasks.map((task) => {
            const id = task._id || task.id;
            const isDone = task.status === 'done';
            const isInProgress = task.status === 'in-progress';
            const projectName = task.projectId?.name || 'DevFlow Project';

            return (
              <div
                key={id}
                className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/60 transition-colors"
              >
                <div className="flex items-start sm:items-center gap-3.5 flex-1 min-w-0">
                  <button
                    type="button"
                    onClick={() => handleCycleStatus(task)}
                    className="mt-0.5 sm:mt-0 p-1 rounded-full text-slate-400 hover:text-blue-600 cursor-pointer shrink-0"
                    title="Toggle Status"
                  >
                    {isDone ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                    ) : isInProgress ? (
                      <Clock className="w-5 h-5 text-blue-600" />
                    ) : (
                      <Circle className="w-5 h-5 text-slate-400" />
                    )}
                  </button>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h4
                        className={`text-sm font-bold ${
                          isDone ? 'line-through text-slate-400' : 'text-slate-900'
                        }`}
                      >
                        {task.title}
                      </h4>

                      <span
                        className={`text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full ${
                          task.priority === 'high'
                            ? 'bg-rose-100 text-rose-700'
                            : task.priority === 'medium'
                            ? 'bg-amber-100 text-amber-700'
                            : 'bg-emerald-100 text-emerald-700'
                        }`}
                      >
                        {task.priority}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 mt-1">
                      <span className="font-semibold text-slate-600 flex items-center gap-1">
                        <FolderKanban className="w-3 h-3 text-slate-400" />
                        {projectName}
                      </span>

                      {task.dueDate && (
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-slate-400" />
                          Due {new Date(task.dueDate).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-center">
                  <button
                    type="button"
                    onClick={() => handleOpenEdit(task)}
                    className="p-2 rounded-xl text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors cursor-pointer"
                    title="Edit Task"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleOpenDelete(task)}
                    className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                    title="Delete Task"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* CREATE TASK MODAL */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Create New Task"
      >
        <form onSubmit={handleCreateSubmit} className="space-y-4">
          {formError && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{formError}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Task Title *
            </label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g. Implement JWT verification middleware"
              className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Associated Project *
            </label>
            <select
              required
              value={formData.projectId}
              onChange={(e) => setFormData({ ...formData, projectId: e.target.value })}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
            >
              <option value="">Select Target Project</option>
              {projects.map((p) => (
                <option key={p._id || p.id} value={p._id || p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Description
            </label>
            <textarea
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Technical specifications or implementation details..."
              className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Priority
              </label>
              <select
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Status
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
              >
                <option value="todo">To Do</option>
                <option value="in-progress">In Progress</option>
                <option value="done">Done</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Due Date
            </label>
            <input
              type="date"
              value={formData.dueDate}
              onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
              className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
            />
          </div>

          <div className="pt-3 flex justify-end gap-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsCreateModalOpen(false)}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs cursor-pointer disabled:opacity-50"
            >
              {submitting ? 'Creating...' : 'Create Task'}
            </button>
          </div>
        </form>
      </Modal>

      {/* EDIT TASK MODAL */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Edit Task"
      >
        <form onSubmit={handleEditSubmit} className="space-y-4">
          {formError && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{formError}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Task Title *
            </label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Associated Project *
            </label>
            <select
              required
              value={formData.projectId}
              onChange={(e) => setFormData({ ...formData, projectId: e.target.value })}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
            >
              {projects.map((p) => (
                <option key={p._id || p.id} value={p._id || p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Description
            </label>
            <textarea
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Priority
              </label>
              <select
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Status
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
              >
                <option value="todo">To Do</option>
                <option value="in-progress">In Progress</option>
                <option value="done">Done</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Due Date
            </label>
            <input
              type="date"
              value={formData.dueDate}
              onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
              className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
            />
          </div>

          <div className="pt-3 flex justify-end gap-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsEditModalOpen(false)}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs cursor-pointer disabled:opacity-50"
            >
              {submitting ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </Modal>

      {/* DELETE TASK MODAL */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Confirm Task Deletion"
      >
        <div className="space-y-4">
          <p className="text-xs text-slate-600 leading-relaxed">
            Are you sure you want to delete task <strong>"{currentTask?.title}"</strong>? This will permanently remove it from MongoDB.
          </p>

          <div className="pt-3 flex justify-end gap-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsDeleteModalOpen(false)}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleDeleteConfirm}
              disabled={submitting}
              className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-xs cursor-pointer disabled:opacity-50"
            >
              {submitting ? 'Deleting...' : 'Delete Task'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
