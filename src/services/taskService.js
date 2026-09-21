import api from './api';

export const taskService = {
  getAllTasks: async (filters = {}) => {
    const query = new URLSearchParams();
    if (filters.status && filters.status !== 'All') {
      const normalizedStatus = filters.status.toLowerCase().replace(/\s+/g, '-');
      query.append('status', normalizedStatus);
    }
    if (filters.priority && filters.priority !== 'All') {
      query.append('priority', filters.priority.toLowerCase());
    }
    if (filters.projectId) {
      query.append('projectId', filters.projectId);
    }
    if (filters.assignedTo) {
      query.append('assignedTo', filters.assignedTo);
    }

    const qs = query.toString() ? `?${query.toString()}` : '';
    const res = await api.get(`/api/tasks${qs}`);
    return res.data || [];
  },

  getTaskById: async (id) => {
    const res = await api.get(`/api/tasks/${id}`);
    return res.data;
  },

  createTask: async (data) => {
    const res = await api.post('/api/tasks', data);
    return res.data;
  },

  updateTask: async (id, data) => {
    const res = await api.put(`/api/tasks/${id}`, data);
    return res.data;
  },

  updateTaskStatus: async (id, status) => {
    const normalizedStatus = status.toLowerCase().replace(/\s+/g, '-');
    const res = await api.patch(`/api/tasks/${id}/status`, { status: normalizedStatus });
    return res.data;
  },

  deleteTask: async (id) => {
    const res = await api.delete(`/api/tasks/${id}`);
    return res.data;
  },
};

export default taskService;
