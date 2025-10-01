import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:3006/",
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error) => {
    if (error.response) {
      return Promise.reject(error.response.data);
    } else {
      return Promise.reject({
        success: false,
        message: "Network error. Please try again.",
        data: null,
      });
    }
  }
);
export default api;
