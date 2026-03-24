import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_URL || '  https://api.marchfastn.shop'

const axiosClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
})

// Request interceptor — attach auth token if present
axiosClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// Response interceptor — normalize errors
axiosClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Handle unauthorized access by clearing token and redirecting
      localStorage.removeItem('token');
      window.location.href = '/login';
    }

    const message =
      error.response?.data?.detail ||
      error.response?.data?.message ||
      error.response?.data?.error ||
      (typeof error.response?.data === 'string' ? error.response.data : null) ||
      error.message ||
      'Something went wrong. Please try again.'

    // Attach friendly message to error object
    error.friendlyMessage = message
    return Promise.reject(error)
  }
)

export default axiosClient
