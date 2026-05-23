import axios from 'axios';

/** Server root without trailing slash — from VITE_API_URL */
export const API_URL = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');

export const apiBaseURL = API_URL ? `${API_URL}/api` : '/api';

export const uploadsBaseURL = API_URL ? `${API_URL}/uploads` : '/uploads';

/** Backend paths like /uploads/... → full URL on Vercel */
export function assetUrl(path) {
  if (!path) return '';
  if (/^https?:\/\//i.test(path)) return path;
  if (!API_URL) return path;
  return `${API_URL}${path.startsWith('/') ? path : `/${path}`}`;
}

const api = axios.create({
  baseURL: apiBaseURL,
  withCredentials: true,
});

api.interceptors.request.use((cfg) => {
  const t = localStorage.getItem('token');
  if (t) cfg.headers.Authorization = `Bearer ${t}`;
  return cfg;
});

api.interceptors.response.use(
  (r) => r,
  (err) => Promise.reject(err)
);

export default api;

/** POST /api/auth/... */
export const Auth = {
  adminLogin: (d) => api.post('/auth/admin/login', d).then((r) => r.data),
  clientLogin: (d) => api.post('/auth/client/login', d).then((r) => r.data),
  changePassword: (d) => api.post('/auth/client/change-password', d).then((r) => r.data),
};

/** POST/GET /api/track/... */
export const Track = {
  byCode: (d) => api.post('/track/code', d).then((r) => r.data),
  forgotPassword: (d) => api.post('/track/forgot-password', d).then((r) => r.data),
  mine: () => api.get('/track/mine').then((r) => r.data),
  getCase: (id) => api.get(`/track/mine/${id}`).then((r) => r.data),
  notifications: () => api.get('/track/notifications').then((r) => r.data),
};

/** GET/POST/PUT/DELETE /api/cases/... */
export const Cases = {
  stats: () => api.get('/cases/stats').then((r) => r.data),
  searchClients: (q) => api.get('/cases/clients/search', { params: { q } }).then((r) => r.data),
  list: (q = '', archived = false) =>
    api.get('/cases', { params: { q, archived: archived ? 'true' : 'false' } }).then((r) => r.data),
  get: (id) => api.get(`/cases/${id}`).then((r) => r.data),
  create: (d) => api.post('/cases', d).then((r) => r.data),
  update: (id, d) => api.put(`/cases/${id}`, d).then((r) => r.data),
  archive: (id) => api.put(`/cases/${id}/archive`).then((r) => r.data),
  addUpdate: (id, d) => api.post(`/cases/${id}/updates`, d).then((r) => r.data),
  addFile: (id, fd) =>
    api.post(`/cases/${id}/files`, fd, { headers: { 'Content-Type': 'multipart/form-data' } }).then((r) => r.data),
  exportPdf: async (id, filename = 'case.pdf') => {
    const r = await api.get(`/cases/${id}/pdf`, { responseType: 'blob' });
    const url = URL.createObjectURL(r.data);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  },
  remove: (id) => api.delete(`/cases/${id}`).then((r) => r.data),
};

/** GET /api/calendar/... */
export const Calendar = {
  events: (params) => api.get('/calendar/events', { params }).then((r) => r.data),
};

/** POST/GET /api/consultations/... */
export const Consultations = {
  create: (d) => api.post('/consultations', d).then((r) => r.data),
  list: (params = {}) => api.get('/consultations', { params }).then((r) => r.data),
  updateStatus: (id, s) => api.put(`/consultations/${id}/status`, { status: s }).then((r) => r.data),
  reply: (id, d) => api.post(`/consultations/${id}/reply`, d).then((r) => r.data),
  whatsappLink: (id, target = 'client') =>
    api.get(`/consultations/${id}/whatsapp-link`, { params: { target } }).then((r) => r.data),
};

/** GET/PUT /api/settings */
export const SettingsAPI = {
  get: () => api.get('/settings').then((r) => r.data),
  update: (d) => {
    if (d instanceof FormData) {
      return api.put('/settings', d, { headers: { 'Content-Type': 'multipart/form-data' } }).then((r) => r.data);
    }
    return api.put('/settings', d).then((r) => r.data);
  },
};

/** Alias — notifications for logged-in clients */
export const Notifications = {
  list: () => Track.notifications(),
};
