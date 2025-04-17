// lib/axiosAuth.ts
import axios from "axios";

// Create instance
const axiosAuth = axios.create({
  baseURL: "http://localhost:3000/api/v1", // Your backend API base
});

// Add token to every request if available
axiosAuth.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default axiosAuth;
