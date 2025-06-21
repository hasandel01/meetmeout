import axios from "axios";

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  withCredentials: true, 
});

let isRefreshing = false;
let failedQueue: (() => void)[] = [];

axiosInstance.interceptors.response.use(
  response => response,
  async error => {
    const originalRequest = error.config;


    if ((error.response?.status === 401 || error.response?.status === 403) && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise(resolve => {
          failedQueue.push(() => resolve(axiosInstance(originalRequest)));
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        await axios.post(
          `${import.meta.env.VITE_API_BASE_URL}/auth/refresh-token`,
          {},
          { withCredentials: true } 
        );

        failedQueue.forEach(cb => cb());
        failedQueue = [];

        return axiosInstance(originalRequest);
      } catch (err) {
        failedQueue = [];
        window.location.href = "/login";
        return Promise.reject(err);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
