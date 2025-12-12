import axios from 'axios';

// Allow overriding the API target via env (useful when the backend chooses a dynamic port)
// Defaults to Vite dev proxy at /api.
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE || '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor to inject the token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Add a response interceptor to handle 401s (optional refresh logic can go here)
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    // If error is 401 and we haven't retried yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        const refreshToken = localStorage.getItem('refreshToken');
        const accessToken = localStorage.getItem('accessToken');
        
        if (refreshToken && accessToken) {
            const response = await axios.post('/api/auth/refresh', {
                accessToken,
                refreshToken
            });
            
            const { accessToken: newAccessToken, refreshToken: newRefreshToken } = response.data;
            
            localStorage.setItem('accessToken', newAccessToken);
            localStorage.setItem('refreshToken', newRefreshToken);
            
            originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
            return api(originalRequest);
        }
      } catch (refreshError) {
        // Refresh failed, logout
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
