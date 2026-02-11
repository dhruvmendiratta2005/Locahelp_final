const API_BASE = "/api";

export async function apiRequest(path, options = {}) {
  const token = localStorage.getItem("locahelp_token");
  const headers = { "Content-Type": "application/json", ...(options.headers || {}) };
  if (token) headers.Authorization = `Bearer ${token}`;

  const response = await fetch(`${API_BASE}${path}`, { ...options, headers });
  let data = {};
  try { data = await response.json(); } catch {}
  if (!response.ok) throw new Error(data.error || "Request failed");
  return data;
}
