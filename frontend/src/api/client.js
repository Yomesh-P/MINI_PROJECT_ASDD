import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor to inject JWT Bearer token into outgoing requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('cricket_auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  getMe: () => api.get('/auth/me'),
};

export const tournamentAPI = {
  getAll: () => api.get('/tournaments'),
  getById: (id) => api.get(`/tournaments/${id}`),
  create: (data) => api.post('/tournaments', data),
};

export const matchAPI = {
  getAll: (params) => api.get('/matches', { params }),
  getLive: () => api.get('/matches/live'),
  getById: (id) => api.get(`/matches/${id}`),
  updateScore: (id, scoreData) => api.put(`/matches/${id}/score`, scoreData),
  recordBall: (id, ballData) => api.post(`/matches/${id}/ball`, ballData),
  create: (data) => api.post('/matches', data),
};

export const standingsAPI = {
  getStandings: (tournamentId) => api.get(`/standings/${tournamentId}`),
};

export const playerAPI = {
  getAll: (params) => api.get('/players', { params }),
  getById: (id) => api.get(`/players/${id}`),
  getForm: (id, limit = 5) => api.get(`/players/${id}/form?limit=${limit}`),
};

export const predictAPI = {
  predictRuns: (payload) => api.post('/predict/runs', payload),
  predictPOM: (payload) => api.post('/predict/pom', payload),
  getPlayerPrediction: (playerId, params) => api.get(`/predict/${playerId}`, { params }),
};

export default api;
