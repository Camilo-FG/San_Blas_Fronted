import axios from 'axios';

export const apiComunion = axios.create({
    baseURL: `https://api.jsonbin.io/v3/b/${import.meta.env.VITE_COMUNION_BIN_ID}`, 
    headers: {
        'Content-Type': 'application/json',
        'X-Access-Key': import.meta.env.VITE_ACCESS_KEY,
    },
});