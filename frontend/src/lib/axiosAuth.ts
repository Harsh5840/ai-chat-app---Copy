// lib/axiosAuth.ts
import axios from "axios";

const API_HOST = process.env.NEXT_PUBLIC_API_URL || 'https://ai-chat-app-copy-l7cx.onrender.com'

const axiosAuth = axios.create({
  baseURL: `${API_HOST}/api/v1`,
});

// Intercept request to attach token
axiosAuth.interceptors.request.use(
  (config) => {
    if (typeof window !== "undefined") {
      const token = window.localStorage.getItem("token");
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default axiosAuth;
