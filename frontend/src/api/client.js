import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? "http://localhost:8080",
});

// Hama request ekakatama token eka auto danawa (login/register walata nemei)
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token && !config.url.startsWith("/api/auth/")) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Token eka expire unoth (401) logout karala login page ekata yawanawa
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && !error.config.url.startsWith("/api/auth/")) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

// Backend eke ApiError eken message eka ganna
export function errorMessage(err) {
  return err.response?.data?.message ?? "Cannot reach the server. Is the backend running?";
}

// Validation errors (field eka anuwa) ganna
export function fieldErrors(err) {
  return err.response?.data?.fieldErrors ?? {};
}

export default api;