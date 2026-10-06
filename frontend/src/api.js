const API_BASE = import.meta.env.VITE_API_URL ||
  (import.meta.env.DEV ? "http://localhost:5000/api" : "/api");

export async function api(path, { token, ...options } = {}) {
  const headers = new Headers(options.headers || {});
  if (options.body) headers.set("Content-Type", "application/json");
  if (token) headers.set("Authorization", `Bearer ${token}`);

  let response;
  try {
    response = await fetch(`${API_BASE}${path}`, { ...options, headers });
  } catch {
    throw new Error("Could not reach FixFlow. Check that the backend is running.");
  }

  const payload = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(payload.message || "The request could not be completed.");
  return payload;
}