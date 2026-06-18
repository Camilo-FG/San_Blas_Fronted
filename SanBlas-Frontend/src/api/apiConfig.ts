import axios from 'axios';

export const apiConfig = axios.create({
    baseURL: 'http://localhost:5146', 
    headers: {
        'Content-Type': 'application/json',
    },
});

//interceptor para agregar el token lwt 
apiConfig.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token'); // O como guarden el token <- OJO KERIL
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);