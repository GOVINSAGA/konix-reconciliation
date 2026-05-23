import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' },
});

export async function triggerReconciliation(config = {}) {
  const { data } = await api.post('/reconcile', config);
  return data;
}

export async function getReport(runId) {
  const { data } = await api.get(`/report/${runId}`);
  return data;
}

export async function getSummary(runId) {
  const { data } = await api.get(`/report/${runId}/summary`);
  return data;
}

export async function getUnmatched(runId) {
  const { data } = await api.get(`/report/${runId}/unmatched`);
  return data;
}

export function getCsvDownloadUrl(runId) {
  return `${API_BASE}/report/${runId}?format=csv`;
}

export default api;
