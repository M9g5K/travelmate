import axios from 'axios';
import { token } from './token';

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
});

api.interceptors.request.use((config) => {
  const t = token.get();
  if (t) config.headers.Authorization = `Bearer ${t}`;
  return config;
});
