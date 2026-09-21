import api from './api';

export const aiService = {
  generateTasks: async (prompt, projectId = null) => {
    const res = await api.post('/api/ai/generate-tasks', {
      prompt,
      projectId: projectId || undefined,
    });
    return res.data;
  },

  saveTasks: async (projectId, tasks) => {
    const res = await api.post('/api/ai/save-tasks', {
      projectId,
      tasks,
    });
    return res.data;
  },

  getProductivitySuggestions: async (projectId = null) => {
    const qs = projectId ? `?projectId=${encodeURIComponent(projectId)}` : '';
    const res = await api.get(`/api/ai/productivity-suggestions${qs}`);
    return res.data;
  },
};

export default aiService;
