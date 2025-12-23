import axios from 'axios';
import Cookies from 'js-cookie';

const apiBaseUrl = 'https://auction-hub-kc24.onrender.com/api';

const apiClient = axios.create({
  baseURL: apiBaseUrl,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ✅ Chỉ dùng 1 Interceptor duy nhất
apiClient.interceptors.request.use(
  (config) => {
    const token = Cookies.get('access_token');
    config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
);

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.warn("Phiên đăng nhập hết hạn hoặc không có quyền truy cập.");
    }
    return Promise.reject(error);
  }
);

export default apiClient;