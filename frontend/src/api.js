const API = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
export function getToken() { return localStorage.getItem("SwipeX_token"); }
export async function api(path, options = {}) {
  const headers = { "Content-Type": "application/json", ...(options.headers || {}) };
  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;
  const response = await fetch(`${API}${path}`, { ...options, headers });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.message || "Request failed");
  return data;
}
export function trackVisit(page) {
  fetch(`${API}/analytics/visit`, {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ page })
  }).catch(() => {});
}
