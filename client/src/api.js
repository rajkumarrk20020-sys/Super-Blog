import axios from 'axios';

const API_BASE_URL = import.meta.env.DEV
  ? 'http://localhost:5000/api'
  : import.meta.env.VITE_API_URL;

if (!import.meta.env.DEV && !API_BASE_URL) {
  throw new Error('Missing VITE_API_URL. Set VITE_API_URL in your production environment.');
}

const api = axios.create({
  baseURL: API_BASE_URL,
});

export default api;
