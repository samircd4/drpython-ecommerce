import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_URL;

const api = axios.create({
    baseURL: BASE_URL,
    headers: {
        "Content-Type": "application/json",
    },
});

// 🔐 Request interceptor (inject access token)
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem("access_token");
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// 🔁 Response interceptor (refresh token on 401)
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        if (
            error.response?.status === 401 &&
            !originalRequest._retry
        ) {
            originalRequest._retry = true;

            try {
                const refreshToken = localStorage.getItem("refresh_token");
                if (!refreshToken) throw new Error("No refresh token");

                // ✅ IMPORTANT: use plain axios (not api)
                const response = await axios.post(
                    `${BASE_URL}/auth/refresh/`,
                    { refresh: refreshToken },
                    { headers: { "Content-Type": "application/json" } }
                );

                const { access } = response.data;

                if (access) {
                    localStorage.setItem("access_token", access);

                    originalRequest.headers.Authorization = `Bearer ${access}`;
                    return api(originalRequest);
                }
            } catch (err) {
                console.error("Refresh token failed", err);

                localStorage.removeItem("access_token");
                localStorage.removeItem("refresh_token");

                window.location.href = "/account";
            }
        }

        return Promise.reject(error);
    }
);

export default api;
export { BASE_URL };
