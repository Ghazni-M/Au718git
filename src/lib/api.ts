const API_URL =
  import.meta.env.VITE_API_URL ||
  "http://localhost:5173";

export function api(path: string, options: RequestInit = {}) {
  return fetch(`${API_URL}${path}`, {
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
    ...options,
  });
}

export { API_URL };