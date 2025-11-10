// axiosConfig.js
import axios from 'axios';

// Create axios instance
const axiosInstance = axios.create({
    baseURL: import.meta.env.VITE_BACKEND_URL,
});

// Request interceptor to add token to headers
axiosInstance.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor to handle token expiration
axiosInstance.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            // Token expired or invalid, clear localStorage and redirect to login
            localStorage.removeItem('token');
            localStorage.removeItem('userInfo');
            // You might want to dispatch a logout action here
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

export default axiosInstance;