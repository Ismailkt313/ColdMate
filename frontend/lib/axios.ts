import axios from "axios";

let accessToken = "";

export const setAccessToken = (token: string) => {
  accessToken = token;
};

export const getAccessToken = () => {
  return accessToken;
};

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000",
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use(
  (config) => {
    const token = getAccessToken();
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      originalRequest.url !== "/auth/refresh-token"
    ) {
      originalRequest._retry = true;

      try {
        const refreshResponse = await axios.post(
          `${api.defaults.baseURL}/auth/refresh-token`,
          {},
          { withCredentials: true }
        );

        if (refreshResponse.data?.success && refreshResponse.data?.data?.accessToken) {
          const newToken = refreshResponse.data.data.accessToken;
          setAccessToken(newToken);

          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
          }

          return api(originalRequest);
        }
      } catch (refreshError) {
        setAccessToken("");
        if (typeof window !== "undefined") {
          window.location.href = `/login?message=${encodeURIComponent("Session expired. Please log in again.")}`;
        }
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;
