
import axios from 'axios';

const ACCESS_KEY = import.meta.env.VITE_ACCESS_KEY;

export const apiComunion = axios.create({
  baseURL: 'https://api.jsonbin.io/v3',
  headers: {
    'Content-Type': 'application/json',
    'X-Access-Key': ACCESS_KEY,
  },
});