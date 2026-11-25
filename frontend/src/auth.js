const KEY = "admin_token";

export const getToken = () => {
  try { return localStorage.getItem(KEY); } catch { return null; }
};
export const setToken = (t) => {
  try { localStorage.setItem(KEY, t); } catch { /* abaikan */ }
};
export const clearToken = () => {
  try { localStorage.removeItem(KEY); } catch { /* abaikan */ }
};
