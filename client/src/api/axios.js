import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: '/api',
  withCredentials: true,
});

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

axiosInstance.interceptors.request.use(
  (config) => {
    const url = config.url || '';
    const isAdminTarget = url.startsWith('/admin') || 
                          url.startsWith('/auth/admin') || 
                          url.includes('/admin') ||
                          url.startsWith('/faqs/all') ||
                          (url.startsWith('/faqs') && config.method && config.method.toLowerCase() !== 'get') ||
                          (url.startsWith('/widgets') && config.method && config.method.toLowerCase() !== 'get') ||
                          (typeof window !== 'undefined' && window.location?.pathname?.startsWith('/admin'));
    
    if (isAdminTarget) {
      try {
        const adminToken = localStorage.getItem('toppscorers_admin_token');
        if (adminToken) {
          config.headers['Authorization'] = `Bearer ${adminToken}`;
          config.headers['x-admin-token'] = adminToken;
          config.headers['x-auth-scope'] = 'admin';
        }
      } catch (e) {}
    }
    return config;
  },
  (error) => Promise.reject(error)
);

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Skip retry for login, refresh, or logout endpoints to prevent infinite loops
    const isAuthRoute = originalRequest?.url?.includes('/auth/login') ||
                        originalRequest?.url?.includes('/auth/refresh') ||
                        originalRequest?.url?.includes('/auth/logout');
    const isAdminRoute = originalRequest?.url?.includes('/admin');

    if (error.response?.status === 401 && !originalRequest?._retry && !isAuthRoute && !isAdminRoute) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then(() => axiosInstance(originalRequest))
          .catch(err => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        await axios.post('/api/auth/refresh', {}, { withCredentials: true });
        processQueue(null);
        return axiosInstance(originalRequest);
      } catch (refreshErr) {
        processQueue(refreshErr, null);
        return Promise.reject(refreshErr);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
