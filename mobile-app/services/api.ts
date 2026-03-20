import axios from 'axios';

export const API = axios.create({
  baseURL: 'http://192.168.1.39:8000', // YOUR PC IP (not localhost)
});