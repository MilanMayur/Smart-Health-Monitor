// lib/api.ts
import axios from 'axios';

const API = axios.create({
    baseURL: 'http://localhost:3001', //process.env.NEXT_PUBLIC_API_URL
    withCredentials: true,
});

export default API;
