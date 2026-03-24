import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

const API_URL = 'https://penakita-api.ibrohimsairony.workers.dev'; // Production API

const axiosClient = axios.create({
  baseURL: API_URL,
  timeout: 15000, // 15 seconds timeout to prevent indefinite loading
  headers: {
    'Content-Type': 'application/json',
  },
});

axiosClient.interceptors.request.use(async (config) => {
  const token = await SecureStore.getItemAsync('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

axiosClient.interceptors.response.use(
  (response) => response,
  (error) => {
    let message = 'Something went wrong. Please try again.';
    
    if (error.response) {
      // Server responded with a status code outside of 2xx
      const data = error.response.data;
      if (data) {
        if (typeof data.error === 'string') {
          message = data.error;
        } else if (typeof data.message === 'string') {
          message = data.message;
        } else if (data.error && typeof data.error === 'object' && typeof data.error.message === 'string') {
          message = data.error.message;
        }
      }
    } else if (error.request) {
      // Request was made but no response was received
      message = 'No response from server. Please check your internet connection.';
    } else {
      // Something happened in setting up the request
      message = error.message;
    }
    
    error.friendlyMessage = message;
    return Promise.reject(error);
  }
);

export default axiosClient;
