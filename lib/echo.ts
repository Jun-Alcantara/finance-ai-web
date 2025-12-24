import Echo from 'laravel-echo';
import Pusher from 'pusher-js';

// Define global interface to avoid TS errors
declare global {
    interface Window {
        Pusher: any;
        Echo: Echo;
    }
}

import axios from 'axios';

// Only initialize on client side
if (typeof window !== 'undefined') {
    window.Pusher = Pusher;

    window.Echo = new Echo({
        broadcaster: 'reverb',
        key: process.env.NEXT_PUBLIC_REVERB_APP_KEY,
        wsHost: process.env.NEXT_PUBLIC_REVERB_HOST,
        wsPort: process.env.NEXT_PUBLIC_REVERB_PORT ?? 80,
        wssPort: process.env.NEXT_PUBLIC_REVERB_PORT ?? 443,
        forceTLS: (process.env.NEXT_PUBLIC_REVERB_SCHEME ?? 'https') === 'https',
        enabledTransports: ['ws', 'wss'],
        authorizer: (channel, options) => {
            return {
                authorize: (socketId, callback) => {
                    axios.post(`${process.env.NEXT_PUBLIC_API_URL}/broadcasting/auth`, {
                        socket_id: socketId,
                        channel_name: channel.name
                    }, {
                        headers: {
                            Authorization: `Bearer ${localStorage.getItem('auth_token')}`
                        }
                    })
                    .then(response => {
                        callback(null, response.data);
                    })
                    .catch(error => {
                        callback(error, null);
                    });
                }
            };
        },
    });
}

export const echo = typeof window !== 'undefined' ? window.Echo : null;
