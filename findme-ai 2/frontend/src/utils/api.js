import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  timeout: 30000,
});

// ─── Cases ──────────────────────────────────────────────
export const getCases = (status = '') =>
  api.get(`/cases${status ? `?status=${status}` : ''}`).then(r => r.data);

export const getCase = (id) =>
  api.get(`/cases/${id}`).then(r => r.data);

export const createCase = (formData) =>
  api.post('/cases', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }).then(r => r.data);

export const updateCaseStatus = (id, status) =>
  api.patch(`/cases/${id}`, { status }).then(r => r.data);

// ─── Sightings ───────────────────────────────────────────
export const getSightings = () =>
  api.get('/sightings').then(r => r.data);

export const createSighting = (formData) =>
  api.post('/sightings', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }).then(r => r.data);

// ─── Matches ─────────────────────────────────────────────
export const getMatches = (filters = {}) => {
  const params = new URLSearchParams(filters).toString();
  return api.get(`/matches${params ? `?${params}` : ''}`).then(r => r.data);
};

export const updateMatch = (id, status) =>
  api.patch(`/matches/${id}`, { status }).then(r => r.data);

export const getStats = () =>
  api.get('/matches/stats').then(r => r.data);

export const healthCheck = () =>
  api.get('/health').then(r => r.data);
