import axios from 'axios';

export const apiClient = axios.create({
    baseURL: `https://api.jsonbin.io/v3/b/${import.meta.env.VITE_SOLICSACRA_BIN_ID}`,
    headers: {
        'Content-Type': 'application/json',
        // Clave específica para solicitudes de sacramento (usar solo esta variable aquí)
        'X-Access-Key': import.meta.env.VITE_ACCESS_KEY_SOLICSACRA,
    },
});