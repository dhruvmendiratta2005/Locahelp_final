const API_BASE = "/api";

export async function apiRequest(path, options = {}) {
  const token = localStorage.getItem("locahelp_token");
  const headers = { "Content-Type": "application/json", ...(options.headers || {}) };
  if (token) headers.Authorization = `Bearer ${token}`;

  const response = await fetch(`${API_BASE}${path}`, { ...options, headers });
  const contentType = response.headers.get("content-type") || "";
  let data = null;
  let text = "";

  if (contentType.includes("application/json")) {
    try {
      data = await response.json();
    } catch {
      data = null;
    }
  } else {
    try {
      text = (await response.text()).trim();
    } catch {
      text = "";
    }
  }

  if (!response.ok) {
    const message =
      data?.error ||
      data?.msg ||
      data?.message ||
      text ||
      `Request failed (${response.status})`;
    if (response.status === 401 || response.status === 422) {
      localStorage.removeItem("locahelp_token");
      localStorage.removeItem("locahelp_user");
    }
    throw new Error(message);
  }

  return data || {};
}
