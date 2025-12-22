import axios from 'axios';
import Cookies from 'js-cookie';

const api = axios.create({
    baseURL: 'http://localhost:8000/api',
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    },
    withCredentials: true, // Necessary for cookies if we used them, but good practice
});

export const setAuthToken = (token: string | null) => {
    if (token) {
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        if (typeof window !== 'undefined') {
            localStorage.setItem('auth_token', token);
            Cookies.set('auth_token', token, { expires: 7 }); // Expires in 7 days
        }
    } else {
        delete api.defaults.headers.common['Authorization'];
        if (typeof window !== 'undefined') {
            localStorage.removeItem('auth_token');
            Cookies.remove('auth_token');
        }
    }
};

// Initialize token from local storage or cookies if checking on client side
if (typeof window !== 'undefined') {
    const token = localStorage.getItem('auth_token') || Cookies.get('auth_token');
    if (token) {
        setAuthToken(token);
    }
}

export default api;
