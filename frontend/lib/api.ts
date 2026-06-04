import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";
import { getToken } from "@/lib/cookies";
import { UninterceptedApiError } from "@/types/api";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL_DEV || "http://localhost:3000",
});

api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

api.interceptors.response.use(
  (response) => response,
  (error: AxiosError<UninterceptedApiError>) => {
    if (error.response?.status === 401) {
      // Handle unauthorized (optional: logout or redirect)
      // logout();
      // window.location.href = '/login';
    }
    return Promise.reject(error);
  },
);

export default api;
