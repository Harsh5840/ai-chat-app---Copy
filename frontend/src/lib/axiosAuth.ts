// lib/axiosAuth.ts
import axios from "axios";

const axiosAuth = axios.create({
  baseURL: "http://localhost:3000/api/v1", // or use env var if deploying
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
