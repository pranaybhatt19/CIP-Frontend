import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:3007/",
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

    if (!error.response) {
      return Promise.reject({
        success: false,
        message: "Network error. Please try again.",
        data: null,
      });
    }

    let errorObj = error.response.data;
    
    if (error.response.status === 409) {
      errorObj = error;
    }

    return Promise.reject(errorObj);
  }
);

export default api;
