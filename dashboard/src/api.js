const BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

async function get(path) {
  const res = await fetch(BASE + path);
  if (!res.ok) throw new Error('Request failed: ' + res.status);
  return res.json();
}

export const getSessions = () => get('/api/sessions');
export const getSessionEvents = (id) =>
  get(`/api/sessions/${encodeURIComponent(id)}/events`);
export const getPages = () => get('/api/pages');
export const getHeatmap = (url) =>
  get('/api/heatmap?url=' + encodeURIComponent(url));