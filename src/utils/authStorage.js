// src/utils/authStorage.js
const KEY = "hanspoon_auth";

export function saveAuth(auth) {
  localStorage.setItem(KEY, JSON.stringify(auth));
}

export function loadAuth() {
  const raw = localStorage.getItem(KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function clearAuth() {
  localStorage.removeItem(KEY);
}

export function getAccessToken() {
  const auth = loadAuth();
  return auth?.accessToken ?? null;
}
