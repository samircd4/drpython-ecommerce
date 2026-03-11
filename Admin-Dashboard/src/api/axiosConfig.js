import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://sarker.shop/api';

const api = axios.create({
    baseURL: BASE_URL,
});

// Interceptor to add JWT to every request
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('access_token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Interceptor to handle token refresh on 401
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;
        if (error.response && error.response.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;
            try {
                const refreshToken = localStorage.getItem('refresh_token');
                const response = await axios.post(`${BASE_URL}/auth/refresh/`, {
                    refresh: refreshToken
                });
                const newToken = response.data.access;
                localStorage.setItem('access_token', newToken);
                originalRequest.headers.Authorization = `Bearer ${newToken}`;
                return api(originalRequest);
            } catch (err) {
                // If refresh fails, log out
                localStorage.removeItem('access_token');
                localStorage.removeItem('refresh_token');
                // Instead of hard redirect, let the AuthProvider handle the null user state
                // window.location.href = '/login';
            }
        }
        return Promise.reject(error);
    }
);

export default api;
