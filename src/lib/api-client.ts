import { useAuthStore } from './store';

interface FetchOptions extends RequestInit {
    headers?: Record<string, string>;
}

export const apiClient = {
    fetch: async (url: string, options: FetchOptions = {}) => {
        const { token, logout } = useAuthStore.getState();

        const headers = {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
            ...options.headers,
        };

        try {
            const response = await fetch(url, {
                ...options,
                headers,
            });

            if (response.status === 401) {
                logout();
                window.location.href = '/login';
                return response;
            }

            return response;
        } catch (error) {
            console.error('API Request failed:', error);
            throw error;
        }
    }
};
