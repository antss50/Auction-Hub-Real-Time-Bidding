// src/lib/axios.ts
import axios, { AxiosError } from 'axios';
import Cookies from 'js-cookie';

const apiBaseUrl = 'http://localhost:3000/api';

const apiClient = axios.create({
  baseURL: `${apiBaseUrl}`
});

apiClient.interceptors.request.use(config => {
  const token = Cookies.get('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  response => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      // Logic xử lý khi token hết hạn
      Cookies.remove('access_token');
      // Chỉ chuyển hướng nếu không phải đang ở trang login
      if (window.location.pathname !== '/auth/login') {
        window.location.href = '/auth/login';
      }
    }
    return Promise.reject(error);
  }
);

export default apiClient;