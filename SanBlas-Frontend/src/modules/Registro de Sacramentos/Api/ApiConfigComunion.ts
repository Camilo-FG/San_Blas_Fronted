import axios from 'axios';

export const apiComunion = axios.create({
    baseURL: '', 
    headers: {
        'Content-Type': 'application/json',
        'X-JSONBin-ApiKey': '', 
        'X-Access-Key': '',
    },
});