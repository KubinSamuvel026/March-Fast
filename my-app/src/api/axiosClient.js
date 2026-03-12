import axios from 'axios';
import { getAccessToken, logout } from '../services/tokenService';
import { API_BASE_URL, API_TIMEOUT } from '../config/apiConfig';

const axiosClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: API_TIMEOUT,
  headers: {
    // Let Axios set Content-Type automatically (e.g., multipart/form-data when using FormData)
    'Accept': 'application/json',
  },
});

// Request interceptor to attach token
axiosClient.interceptors.request.use(
  (config) => {
    const token = getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle 401 errors
axiosClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response && error.response.status === 401) {
      // Handle unauthorized access (e.g., token expired)
      logout();
      // Optional: redirect to login without triggering full reload, normally handled in AuthContext or app level
      window.dispatchEvent(new Event('unauthorized'));
    }
    return Promise.reject(error);
  }
);

export default axiosClient;
