import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";
import { UninterceptedApiError } from "@/types/api";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL_DEV || "http://localhost:3000",
  withCredentials: true,
});

api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
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
