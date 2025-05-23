import axios from "axios";
import authAxios from "../auth/axios/authAxios";


const axiosInstance = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL,
    headers: {
        "Content-Type": "application/json",
    },
})




axiosInstance.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem("accessToken");
        if(token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        
        }
        return config;
    },
    (error) => Promise.reject(error)
)



axiosInstance.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        if(error.response?.status === 403 && !originalRequest._retry) {
            originalRequest._retry = true;
        
        
            try {
                const refreshToken = localStorage.getItem("refreshToken");
                const response = await authAxios.post(`/auth/refresh-token`, {
                    refreshToken
                })


                const newAccessToken = response.data.accessToken;
                localStorage.setItem("accessToken",newAccessToken);

                originalRequest.headers['Authorization'] = `Bearer ${newAccessToken}`;
                return axiosInstance(originalRequest);
            } catch(refreshError ) {
                console.log("Refresh token expired, logging out.");
                localStorage.clear();
                window.location.href ="/login";
                return Promise.reject(refreshError);
            }
            
        }

        return Promise.reject(error)
    }
)

export default axiosInstance;