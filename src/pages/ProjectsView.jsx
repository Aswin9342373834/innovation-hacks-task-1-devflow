import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  FolderKanban,
  Plus,
  Search,
  SlidersHorizontal,
  Edit2,
  Trash2,
  Eye,
  CheckCircle2,
  Clock,
  Archive,
  User,
  AlertCircle,
} from 'lucide-react';
import projectService from '../services/projectService';
import taskService from '../services/taskService';
import { useAuth } from '../context/AuthContext';
import Modal from '../components/Modal';
import ProgressBar from '../components/ProgressBar';
import LoadingState from '../components/LoadingState';
import EmptyState from '../components/EmptyState';
import ErrorState from '../components/ErrorState';

export default function ProjectsView({ onNavigateToTasks }) {
  const { user } = useAuth();

  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  // Modals
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);

  // Active project selection
  const [currentProject, setCurrentProject] = useState(null);
  const [projectTasks, setProjectTasks] = useState([]);
  const [loadingProjectTasks, setLoadingProjectTasks] = useState(false);

  // Form states
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    status: 'active',
    progress: 0,
  });
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Fetch projects from MongoDB API
  const fetchProjects = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await projectService.getAllProjects();
      setProjects(data);
    } catch (err) {
      setError(err.message || 'Failed to load projects from server.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  // Filter projects by search and status
  const filteredProjects = useMemo(() => {
    return projects.filter((p) => {
      const matchesSearch =
        !searchQuery.trim() ||
        p.name?.toLowerCase().includes(searchQuery.toLowerCase().trim()) ||
        p.description?.toLowerCase().includes(searchQuery.toLowerCase().trim());

      const matchesStatus =
        statusFilter === 'All' || p.status?.toLowerCase() === statusFilter.toLowerCase();

      return matchesSearch && matchesStatus;
    });
  }, [projects, searchQuery, statusFilter]);

  // Open Create Modal
  const handleOpenCreate = () => {
    setFormData({
      name: '',
      description: '',
      status: 'active',
      progress: 0,
    });
    setFormError('');
    setIsCreateModalOpen(true);
  };

  // Submit Create Project
  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim() || formData.name.trim().length < 2) {
      setFormError('Project name must be at least 2 characters long.');
      return;
    }
    if (!formData.description.trim() || formData.description.trim().length < 5) {
      setFormError('Description must be at least 5 characters long.');
      return;
    }

    setSubmitting(true);
    setFormError('');
    try {
      const newProject = await projectService.createProject({
        name: formData.name.trim(),
        description: formData.description.trim(),
        status: formData.status,
        progress: Number(formData.progress) || 0,
        ownerId: user?.id || user?._id,
      });

      setProjects((prev) => [newProject, ...prev]);
      setIsCreateModalOpen(false);
    } catch (err) {
      setFormError(err.message || 'Failed to create project.');
    } finally {
      setSubmitting(false);
    }
  };

  // Open Edit Modal
  const handleOpenEdit = (project) => {
    setCurrentProject(project);
    setFormData({
      name: project.name || '',
      description: project.description || '',
      status: project.status || 'active',
      progress: project.progress || 0,
    });
    setFormError('');
    setIsEditModalOpen(true);
  };

  // Submit Edit Project
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim() || formData.name.trim().length < 2) {
      setFormError('Project name must be at least 2 characters long.');
      return;
    }
    if (!formData.description.trim() || formData.description.trim().length < 5) {
      setFormError('Description must be at least 5 characters long.');
      return;
    }

    setSubmitting(true);
    setFormError('');
    try {
      const id = currentProject._id || currentProject.id;
      const updated = await projectService.updateProject(id, {
        name: formData.name.trim(),
        description: formData.description.trim(),
        status: formData.status,
        progress: Number(formData.progress) || 0,
      });

      setProjects((prev) =>
        prev.map((p) => ((p._id || p.id) === id ? { ...p, ...updated } : p))
      );
      setIsEditModalOpen(false);
    } catch (err) {
      setFormError(err.message || 'Failed to update project.');
    } finally {
      setSubmitting(false);
    }
  };

  // Open Delete Confirmation Modal
  const handleOpenDelete = (project) => {
    setCurrentProject(project);
    setIsDeleteModalOpen(true);
  };

  // Confirm Delete
  const handleDeleteConfirm = async () => {
    if (!currentProject) return;
    const id = currentProject._id || currentProject.id;

    setSubmitting(true);
    try {
      await projectService.deleteProject(id);
      setProjects((prev) => prev.filter((p) => (p._id || p.id) !== id));
      setIsDeleteModalOpen(false);
    } catch (err) {
      alert(err.message || 'Failed to delete project.');
    } finally {
      setSubmitting(false);
    }
  };

  // Open Details Modal
  const handleOpenDetails = async (project) => {
    setCurrentProject(project);
    setIsDetailsModalOpen(true);
    setLoadingProjectTasks(true);

    try {
      const id = project._id || project.id;
      const tasks = await taskService.getAllTasks({ projectId: id });
      setProjectTasks(tasks);
    } catch (err) {
      console.error('Failed to load project tasks:', err);
      setProjectTasks([]);
    } finally {
      setLoadingProjectTasks(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
            <FolderKanban className="w-7 h-7 text-blue-600" />
            Project Management
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Create, track, and manage all your team projects in MongoDB
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenCreate}
          className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-500/20 transition-all flex items-center gap-2 cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          New Project
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search projects..."
            className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <SlidersHorizontal className="w-4 h-4 text-slate-400" />
          <span className="text-xs font-semibold text-slate-500">Status:</span>
          {['All', 'Active', 'Completed', 'Archived'].map((status) => (
            <button
              key={status}
              type="button"
              onClick={() => setStatusFilter(status)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
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

      {/* Projects Grid / Content */}
      {loading ? (
        <LoadingState message="Fetching projects from database..." />
      ) : error ? (
        <ErrorState message={error} onRetry={fetchProjects} />
      ) : filteredProjects.length === 0 ? (
        <EmptyState
          title="No Projects Found"
          description={
            searchQuery || statusFilter !== 'All'
              ? 'No projects match your current search and filter criteria.'
              : 'Get started by creating your first team project.'
          }
          actionLabel="Create Project"
          onAction={handleOpenCreate}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map((project) => {
            const id = project._id || project.id;
            const isCompleted = project.status === 'completed';
            const isArchived = project.status === 'archived';

            return (
              <div
                key={id}
                className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs hover:shadow-md hover:border-slate-300 transition-all flex flex-col justify-between group"
              >
                <div className="space-y-4">
                  {/* Status & Actions Header */}
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full flex items-center gap-1 ${
                        isCompleted
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : isArchived
                          ? 'bg-slate-100 text-slate-600 border border-slate-200'
                          : 'bg-blue-50 text-blue-700 border border-blue-200'
                      }`}
                    >
                      {isCompleted ? (
                        <CheckCircle2 className="w-3 h-3" />
                      ) : isArchived ? (
                        <Archive className="w-3 h-3" />
                      ) : (
                        <Clock className="w-3 h-3" />
                      )}
                      {project.status || 'Active'}
                    </span>

                    <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                      <button
                        type="button"
                        onClick={() => handleOpenDetails(project)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors cursor-pointer"
                        title="View Project Details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleOpenEdit(project)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors cursor-pointer"
                        title="Edit Project"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleOpenDelete(project)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                        title="Delete Project"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Title & Description */}
                  <div>
                    <h3 className="font-bold text-slate-900 text-base group-hover:text-blue-600 transition-colors">
                      {project.name}
                    </h3>
                    <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                      {project.description}
                    </p>
                  </div>

                  {/* Progress Bar */}
                  <div className="space-y-1.5 pt-1">
                    <div className="flex justify-between text-[11px] font-semibold text-slate-600">
                      <span>Progress</span>
                      <span>{project.progress || 0}%</span>
                    </div>
                    <ProgressBar progress={project.progress || 0} />
                  </div>
                </div>

                {/* Footer info: Owner & Link to Tasks */}
                <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                  <div className="flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-slate-400" />
                    <span className="truncate max-w-[120px]">
                      {project.ownerId?.name || 'DevFlow Team'}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => onNavigateToTasks && onNavigateToTasks(id)}
                    className="text-blue-600 hover:text-blue-700 font-bold text-xs inline-flex items-center gap-1 cursor-pointer"
                  >
                    View Tasks &rarr;
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* CREATE PROJECT MODAL */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Create New Project"
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
              Project Name *
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
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
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
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
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
              >
                <option value="active">Active</option>
                <option value="completed">Completed</option>
                <option value="archived">Archived</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Initial Progress ({formData.progress}%)
              </label>
              <input
                type="range"
                min="0"
                max="100"
                value={formData.progress}
                onChange={(e) => setFormData({ ...formData, progress: e.target.value })}
                className="w-full accent-blue-600 mt-2 cursor-pointer"
              />
            </div>
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
              {submitting ? 'Creating...' : 'Create Project'}
            </button>
          </div>
        </form>
      </Modal>

      {/* EDIT PROJECT MODAL */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Edit Project"
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
              Project Name *
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
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
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Status
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
              >
                <option value="active">Active</option>
                <option value="completed">Completed</option>
                <option value="archived">Archived</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Progress ({formData.progress}%)
              </label>
              <input
                type="range"
                min="0"
                max="100"
                value={formData.progress}
                onChange={(e) => setFormData({ ...formData, progress: e.target.value })}
                className="w-full accent-blue-600 mt-2 cursor-pointer"
              />
            </div>
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
              {submitting ? 'Updating...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </Modal>

      {/* DELETE CONFIRMATION MODAL */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Confirm Project Deletion"
      >
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs leading-relaxed">
            <p className="font-bold flex items-center gap-1.5 text-rose-900 mb-1">
              <AlertCircle className="w-4 h-4 text-rose-600" />
              Warning: Destructive Action
            </p>
            Deleting project <strong>"{currentProject?.name}"</strong> will remove it from MongoDB along with all associated tasks.
          </div>

          <p className="text-xs text-slate-600">
            Are you sure you want to proceed? This cannot be undone.
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
              {submitting ? 'Deleting...' : 'Delete Project & Tasks'}
            </button>
          </div>
        </div>
      </Modal>

      {/* PROJECT DETAILS MODAL */}
      <Modal
        isOpen={isDetailsModalOpen}
        onClose={() => setIsDetailsModalOpen(false)}
        title={currentProject?.name || 'Project Overview'}
      >
        {currentProject && (
          <div className="space-y-6">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Description
              </p>
              <p className="text-sm text-slate-700 mt-1 leading-relaxed">
                {currentProject.description}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-100">
              <div>
                <p className="text-[11px] font-bold text-slate-400 uppercase">Status</p>
                <p className="text-xs font-bold text-slate-800 mt-0.5 capitalize">
                  {currentProject.status}
                </p>
              </div>

              <div>
                <p className="text-[11px] font-bold text-slate-400 uppercase">Progress</p>
                <p className="text-xs font-bold text-blue-600 mt-0.5">
                  {currentProject.progress}%
                </p>
              </div>

              <div>
                <p className="text-[11px] font-bold text-slate-400 uppercase">Owner</p>
                <p className="text-xs font-semibold text-slate-800 mt-0.5">
                  {currentProject.ownerId?.name || 'DevFlow Team'}
                </p>
              </div>

              <div>
                <p className="text-[11px] font-bold text-slate-400 uppercase">Created</p>
                <p className="text-xs font-semibold text-slate-800 mt-0.5">
                  {currentProject.createdAt ? new Date(currentProject.createdAt).toLocaleDateString() : 'Active'}
                </p>
              </div>
            </div>

            {/* Project Tasks Summary */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-xs font-bold text-slate-900">
                  Associated Tasks ({projectTasks.length})
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setIsDetailsModalOpen(false);
                    if (onNavigateToTasks) onNavigateToTasks(currentProject._id || currentProject.id);
                  }}
                  className="text-xs text-blue-600 hover:text-blue-700 font-semibold cursor-pointer"
                >
                  Manage in Tasks &rarr;
                </button>
              </div>

              {loadingProjectTasks ? (
                <div className="text-xs text-slate-400 py-3 text-center">
                  Loading tasks...
                </div>
              ) : projectTasks.length === 0 ? (
                <p className="text-xs text-slate-500 italic py-2">
                  No tasks assigned to this project yet. Use the AI Task Generator to populate it!
                </p>
              ) : (
                <div className="max-h-48 overflow-y-auto space-y-2 pr-1">
                  {projectTasks.slice(0, 5).map((t) => (
                    <div
                      key={t._id || t.id}
                      className="p-2.5 rounded-xl border border-slate-200 bg-white flex items-center justify-between text-xs"
                    >
                      <span className="font-semibold text-slate-800 truncate max-w-[200px]">
                        {t.title}
                      </span>
                      <span
                        className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                          t.status === 'done'
                            ? 'bg-emerald-50 text-emerald-700'
                            : t.status === 'in-progress'
                            ? 'bg-amber-50 text-amber-700'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {t.status}
                      </span>
                    </div>
                  ))}
                  {projectTasks.length > 5 && (
                    <p className="text-[11px] text-slate-400 text-center pt-1">
                      + {projectTasks.length - 5} more tasks
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
