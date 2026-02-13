// src/API.js
import axios from "axios";

const API = axios.create({
  baseURL: "https://hits-aiml-department-website.vercel.app/",
});

export default API;
