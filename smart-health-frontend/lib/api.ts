// lib/api.ts
import axios from 'axios';

const API = axios.create({
    baseURL: 'http://13.201.82.56:3001' || 'http://localhost:3001', 
    withCredentials: true,
});

export default API;
