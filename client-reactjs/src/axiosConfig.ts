import axios from 'axios';
import { ACCESSTOKEN_KEY } from './app/constant';


const axiosWithHeader = axios.create({
    baseURL: import.meta.env.VITE_BASE_URL || 'http://localhost:3000',
});

// Add a request interceptor
axiosWithHeader.interceptors.request.use(
    (config) => {
        const accessTokenStorage = localStorage.getItem(ACCESSTOKEN_KEY);

        if (accessTokenStorage) {
            const accessToken = JSON.parse(accessTokenStorage).accessToken
            config.headers['Authorization'] = `Bearer ${accessToken}`;
        }
        // Check if the request data is FormData
        if (config.data instanceof FormData) {
            config.headers['Content-Type'] = 'multipart/form-data';
        } else {
            config.headers['Content-Type'] = 'application/json';
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export default axiosWithHeader;

