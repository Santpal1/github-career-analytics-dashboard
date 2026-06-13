import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor to add authorization token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

/**
 * Trigger fresh analysis for a username.
 */
export async function analyzeUser(username) {
  const response = await api.post('/analytics/analyze', { username });
  return response.data;
}

/**
 * Fetch cached analysis for a username.
 */
export async function getUserData(username) {
  const response = await api.get(`/analytics/user/${username}`);
  return response.data;
}

/**
 * Perform a mock developer/recruiter login.
 */
export async function loginMock(username, role) {
  const response = await api.post('/auth/login-mock', { username, role });
  if (response.data.token) {
    localStorage.setItem('token', response.data.token);
    localStorage.setItem('user', JSON.stringify(response.data.user));
  }
  return response.data;
}

/**
 * Fetch details of currently logged-in user.
 */
export async function getCurrentUser() {
  const response = await api.get('/auth/me');
  return response.data;
}

/**
 * Logout and clear local cache.
 */
export function logout() {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
}

export default api;
