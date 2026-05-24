import axios from 'axios';

export const apiClient = axios.create({
    baseURL: 'https://api.jsonbin.io/v3/b', // Base URL para JSONBin (ID se añade en los servicios)
    headers: {
        'Content-Type': 'application/json',
        // Add any other headers you need here, such as Authorization
        'X-JSONBin-ApiKey': '$2a$10$m.3DH7V6QOlhXAVpj4sWu.7eMmRVwtYTbNFnX9MogOBTTZK4Mw43O', 
        'X-Access-Key': '$2a$10$m.3DH7V6QOlhXAVpj4sWu.7eMmRVwtYTbNFnX9MogOBTTZK4Mw43O',
    },
});