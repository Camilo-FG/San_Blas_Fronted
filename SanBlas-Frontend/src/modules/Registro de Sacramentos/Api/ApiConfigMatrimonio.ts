import axios from 'axios';

export const apiMatrimonio = axios.create({
    baseURL: `https://api.jsonbin.io/v3/b/${import.meta.env.VITE_MATRIMONIO_BIN_ID}`, 
    headers: {
        'Content-Type': 'application/json',
        'X-Access-Key': import.meta.env.VITE_ACCESS_KEY,
    },
});