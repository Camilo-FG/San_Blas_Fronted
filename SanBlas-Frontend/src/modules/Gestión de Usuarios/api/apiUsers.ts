import axios from 'axios';

//tuve que hacerlo así pq si escribo import.meta.env... dá un error:
//property .env doesn't exist on type 'importMeta', esto sucede pq TypeScript no sabe de forma 
//automática que Vite añadió la propiedad .env a import.meta, por eso es que no lo reconoce 
const API_KEY = (import.meta as any).env.USERS_API_ACCESS_KEY; 

export const apiUsers = axios.create({
    baseURL: 'https://api.jsonbin.io/v3',
    headers: {
        'Content-Type': 'application/json',
        'X-Access-Key': API_KEY
    }
});