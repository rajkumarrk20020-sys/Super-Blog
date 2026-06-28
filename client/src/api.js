import axios from 'axios';

const RAW_API_URL = import.meta.env.DEV
  ? 'http://localhost:5000'
  : import.meta.env.VITE_API_URL;

const API_BASE_URL = import.meta.env.DEV
  ? `${RAW_API_URL}/api`
  : `${RAW_API_URL?.replace(/\/api\/?$/, '')}/api`;

if (!import.meta.env.DEV && !RAW_API_URL) {
  throw new Error('Missing VITE_API_URL. Set VITE_API_URL in your production environment.');
}

const api = axios.create({
  baseURL: API_BASE_URL,
});

export default api;
