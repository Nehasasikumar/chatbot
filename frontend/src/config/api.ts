import axios from 'axios';

// Configure your Flask backend URL here
const API_BASE_URL = 'http://localhost:5000'; // Change this to your Flask server URL

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export default api;