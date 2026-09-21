import api from './api';

export const projectService = {
  getAllProjects: async (params = {}) => {
    const query = new URLSearchParams();
    if (params.status && params.status !== 'All') query.append('status', params.status.toLowerCase());
    const qs = query.toString() ? `?${query.toString()}` : '';
    const res = await api.get(`/api/projects${qs}`);
    return res.data || [];
  },

  getProjectById: async (id) => {
    const res = await api.get(`/api/projects/${id}`);
    return res.data;
  },

  createProject: async (data) => {
    const res = await api.post('/api/projects', data);
    return res.data;
  },

  updateProject: async (id, data) => {
    const res = await api.put(`/api/projects/${id}`, data);
    return res.data;
  },

  deleteProject: async (id) => {
    const res = await api.delete(`/api/projects/${id}`);
    return res.data;
  },
};

export default projectService;
