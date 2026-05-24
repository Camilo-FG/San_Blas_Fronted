import axios from 'axios';

export const apiConfirma = axios.create({
    baseURL: '', 
    headers: {
        'Content-Type': 'application/json',
        'X-JSONBin-ApiKey': '', 
        'X-Access-Key': '',
    },
});