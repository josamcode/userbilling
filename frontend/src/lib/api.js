// Central API helper. Reads NEXT_PUBLIC_API_BASE_URL and attaches the JWT.
const RAW_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000";
export const API_BASE = RAW_BASE.replace(/\/+$/, "");

const TOKEN_KEY = "ub_token";

export function getToken() {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

export function setToken(token) {
  if (typeof window === "undefined") return;
  try {
    if (token) window.localStorage.setItem(TOKEN_KEY, token);
    else window.localStorage.removeItem(TOKEN_KEY);
  } catch {
    /* ignore */
  }
}

export function clearToken() {
  setToken(null);
}

function joinUrl(path) {
  const p = path.startsWith("/") ? path : `/${path}`;
  return `${API_BASE}${p}`;
}

async function handleResponse(res) {
  const isJson = (res.headers.get("content-type") || "").includes(
    "application/json"
  );
  const body = isJson ? await res.json().catch(() => null) : null;

  if (res.status === 401 && typeof window !== "undefined") {
    clearToken();
    // Avoid bouncing the user from the login page itself.
    if (!window.location.pathname.startsWith("/login")) {
      window.location.href = "/login";
    }
  }

  if (!res.ok) {
    const message =
      (body && (body.message || body.error)) ||
      `HTTP ${res.status}`;
    const err = new Error(message);
    err.status = res.status;
    err.data = body;
    throw err;
  }
  return body;
}

export async function apiFetch(path, options = {}) {
  const { method = "GET", body, headers = {}, isFormData = false } = options;
  const token = getToken();
  const finalHeaders = { ...headers };
  if (!isFormData && body !== undefined) {
    finalHeaders["Content-Type"] = "application/json";
  }
  if (token) finalHeaders["Authorization"] = `Bearer ${token}`;

  const res = await fetch(joinUrl(path), {
    method,
    headers: finalHeaders,
    body: isFormData ? body : body !== undefined ? JSON.stringify(body) : undefined,
  });
  return handleResponse(res);
}

export const api = {
  get: (path) => apiFetch(path),
  post: (path, body) => apiFetch(path, { method: "POST", body }),
  put: (path, body) => apiFetch(path, { method: "PUT", body }),
  del: (path) => apiFetch(path, { method: "DELETE" }),
  postForm: (path, formData) =>
    apiFetch(path, { method: "POST", body: formData, isFormData: true }),
  putForm: (path, formData) =>
    apiFetch(path, { method: "PUT", body: formData, isFormData: true }),
};
