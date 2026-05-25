import axios from 'axios';

export const apiUsers = axios.create({
    baseURL: 'https://api.jsonbin.io/v3/b/',
    headers: {
        'Content-Type': 'application/json',
        'X-Access-Key': import.meta.env.VITE_JSONBIN_KEY
    }
});