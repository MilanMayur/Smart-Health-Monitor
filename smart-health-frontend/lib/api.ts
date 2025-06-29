// lib/api.ts
import axios from 'axios';

const API = axios.create({
    baseURL: 'http://<ec2-ip>:3001', //process.env.NEXT_PUBLIC_API_URL, http://localhost:3001 
    withCredentials: true,
});

export default API;
