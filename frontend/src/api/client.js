import { getToken, clearToken } from "../auth";

const BASE = (import.meta.env.VITE_API_URL || "http://localhost:3000").replace(/\/$/, "");

export class ApiError extends Error {
  constructor(message, status, data) {
    super(message);
    this.status = status;
    this.data = data;
  }
}

function messageFor(status, data) {
  if (status === 429) return "Terlalu banyak permintaan scan. Tunggu 1 menit sebelum mencoba lagi.";
  const fromApi = data && (data.message || data.error);
  if (fromApi) return fromApi;
  if (status === 404) return "Data tidak ditemukan.";
  if (status >= 500) return "Terjadi kesalahan di server. Coba lagi sebentar lagi.";
  return "Terjadi kesalahan. Coba lagi.";
}

async function request(path, { method = "GET", body, form, token, params } = {}) {
  const url = new URL(BASE + path);
  if (params) {
    Object.entries(params).forEach(([k, v]) => {
      if (v) url.searchParams.set(k, v);
    });
  }
  const headers = {};
  let payload;
  if (form) {
    payload = form; // multipart: biarkan browser mengisi Content-Type
  } else if (body) {
    headers["Content-Type"] = "application/json";
    payload = JSON.stringify(body);
  }
  if (token) headers.Authorization = `Bearer ${token}`;

  let res;
  try {
    res = await fetch(url, { method, headers, body: payload });
  } catch {
    throw new ApiError("Tidak bisa terhubung ke server. Periksa koneksi lalu coba lagi.", 0);
  }

  let data = null;
  try { data = await res.json(); } catch { /* respons tanpa JSON */ }

  if (!res.ok) throw new ApiError(messageFor(res.status, data), res.status, data);
  return data;
}

// ---------- Publik ----------
export const api = {
  listFounds: (params) => request("/api/founds", { params }),
  getFound: (id) => request(`/api/founds/${id}`),
  createFound: (body) => request("/api/founds", { method: "POST", body }),
  classify: (file) => {
    const form = new FormData();
    form.append("image", file); // nama field wajib "image"
    return request("/api/founds/classify", { method: "POST", form });
  },
};

// ---------- Admin ----------
async function adminRequest(path, opts = {}) {
  try {
    return await request(`/api/admin${path}`, { ...opts, token: getToken() });
  } catch (e) {
    if (e.status === 401 || e.status === 403) {
      clearToken();
      window.location.assign("/admin/login?expired=1");
    }
    throw e;
  }
}

export const adminApi = {
  login: (nama_admin, password) =>
    request("/api/admin/auth/login", { method: "POST", body: { nama_admin, password } }),
  register: (nama_admin, password) =>
    request("/api/admin/auth/register", { method: "POST", body: { nama_admin, password } }),
  listFounds: () => adminRequest("/founds"),
  getFound: (id) => adminRequest(`/founds/${id}`),
  createFound: (body) => adminRequest("/founds", { method: "POST", body }),
  updateFound: (id, body) => adminRequest(`/founds/${id}`, { method: "PUT", body }),
  deleteFound: (id) => adminRequest(`/founds/${id}`, { method: "DELETE" }),
};
