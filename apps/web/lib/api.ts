import axios from 'axios';
import { token } from './token';

export const api = axios.create({
  baseURL: 'https://travelmate-production-3ac4.up.railway.app',
});

api.interceptors.request.use((config) => {
  const t = token.get();
  if (t) config.headers.Authorization = `Bearer ${t}`;
  return config;
});
