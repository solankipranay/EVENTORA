import axios from 'axios';

const configuredApiUrl = import.meta.env.VITE_API_URL?.trim();
const localApiUrl = 'http://localhost:5000/api';
const productionApiUrl = 'https://eventora-1-uaje.onrender.com/api';

let hasRemoteApiUrl = false;
if (configuredApiUrl) {
    try {
        const parsedApiUrl = new URL(configuredApiUrl);
        hasRemoteApiUrl = ['http:', 'https:'].includes(parsedApiUrl.protocol)
            && !['localhost', '127.0.0.1', '::1'].includes(parsedApiUrl.hostname);
    } catch {
        hasRemoteApiUrl = false;
    }
}

const api = axios.create({
    baseURL: import.meta.env.PROD
        ? (hasRemoteApiUrl ? configuredApiUrl : productionApiUrl)
        : (configuredApiUrl || localApiUrl),
});

api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export default api;
