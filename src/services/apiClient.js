import axios from "axios";

const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:8000/api";

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Outgoing Request Interceptor Logging
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token") || localStorage.getItem("authToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    console.log(`🚀 [FRONTEND API OUT] ${config.method.toUpperCase()} ${config.baseURL}${config.url}`, {
      params: config.params || {},
      data: config.data || {},
      hasAuthToken: !!token
    });
    return config;
  },
  (error) => {
    console.error("❌ [FRONTEND API OUT ERROR]", error);
    return Promise.reject(error);
  }
);

// Incoming Response Interceptor Logging
apiClient.interceptors.response.use(
  (response) => {
    console.log(`✅ [FRONTEND API IN] ${response.status} ${response.config.url}`, response.data);
    return response;
  },
  (error) => {
    console.error(`❌ [FRONTEND API IN ERROR] ${error.response?.status || 'Network Error'} ${error.config?.url}`, error.response?.data || error.message);
    return Promise.reject(error);
  }
);

export default apiClient;
