import axios from 'axios';

export const apiClient = axios.create({
    baseURL: '',
    headers: {
        'Content-Type': 'application/json',
        'X-JOSNbin-ApiKey': '',
        'x-Access-key': ''
    }
});