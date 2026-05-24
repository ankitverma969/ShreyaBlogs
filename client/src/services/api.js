import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json'
  }
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const config = error.config;

    if (!config || config.__retried || !['get', 'GET'].includes(config.method)) {
      return Promise.reject(error);
    }

    config.__retried = true;
    await new Promise((resolve) => setTimeout(resolve, 350));
    return api(config);
  }
);

export default api;
