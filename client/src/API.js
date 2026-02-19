// src/API.js
import axios from "axios";

// Create an Axios instance
const API = axios.create({
  baseURL: process.env.REACT_APP_API_URL || "http://localhost:5000",
  withCredentials: false, // keep false unless you need cookies
  headers: {
    "Accept": "application/json",
  },
});

// Optional: Add a response interceptor to handle errors globally
API.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error("API Error:", error.response?.data || error.message);
    return Promise.reject(error);
  }
);

export default API;
