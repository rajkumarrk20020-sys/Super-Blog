import axios from 'axios';

const RAW_API_URL = import.meta.env.DEV
  ? 'http://localhost:5000'
  : (import.meta.env.VITE_API_URL || (typeof window !== 'undefined' && window.__SMARTBLOG_API_URL__) || null);

// Provide a safe fallback to avoid crashing the app if VITE_API_URL wasn't set at build time.
// Recommended: set `VITE_API_URL` in your Vercel/CI build environment to the backend origin.
let API_BASE_URL;
if (import.meta.env.DEV) {
  API_BASE_URL = `${RAW_API_URL}/api`;
} else {
  const resolvedRaw = RAW_API_URL ? RAW_API_URL.replace(/\/api\/?$/, '') : (typeof window !== 'undefined' ? window.location.origin : '');
  API_BASE_URL = `${resolvedRaw}/api`;
  if (!RAW_API_URL) {
    // Warn instead of throwing so the app can start; this avoids hard-crashing when env vars are misconfigured.
    // In production, build-time env must be set to point to the backend for correct API behavior.
    // eslint-disable-next-line no-console
    console.warn('VITE_API_URL not set at build time — falling back to', resolvedRaw);
  }
}

const api = axios.create({
  baseURL: API_BASE_URL,
});

export default api;
