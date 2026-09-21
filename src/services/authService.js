import api from './api';

export const authService = {
  register: async (userData) => {
    const res = await api.post('/api/auth/register', userData);
    return res.data;
  },

  login: async (credentials) => {
    const res = await api.post('/api/auth/login', credentials);
    return res.data;
  },

  getMe: async () => {
    const res = await api.get('/api/auth/me');
    return res.data;
  },

  logout: async () => {
    try {
      await api.post('/api/auth/logout');
    } catch {
      // Client-side logout proceeds regardless
    }
  },
};

export default authService;
