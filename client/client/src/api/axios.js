import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:8000/api/v1",
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use((config) => {
  const saved = localStorage.getItem("auth-storage");

  if (saved) {
    const { state } = JSON.parse(saved);

    if (state?.token) {
      config.headers.Authorization = `Bearer ${state.token}`;
    }
  }

  return config;
});

export default api;