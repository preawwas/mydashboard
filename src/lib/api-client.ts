import { useAuthStore } from './store';

interface FetchOptions extends RequestInit {
    headers?: Record<string, string>;
}

const inFlightGetRequests = new Map<string, Promise<Response>>();

export const apiClient = {
    fetch: async (url: string, options: FetchOptions = {}) => {
        const { token, logout } = useAuthStore.getState();
        const method = (options.method || 'GET').toUpperCase();
        const requestKey = `${method}:${url}:${token || 'anonymous'}`;

        const headers = {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
            ...options.headers,
        };

        const performRequest = async () => {
            const response = await fetch(url, {
                ...options,
                headers,
            });

            if (response.status === 401) {
                logout();
                window.location.href = '/login';
            }

            return response;
        };

        try {
            // Deduplicate concurrent GET requests (useful in React Strict Mode dev double effects)
            if (method === 'GET') {
                const existing = inFlightGetRequests.get(requestKey);
                if (existing) {
                    const sharedResponse = await existing;
                    return sharedResponse.clone();
                }

                const requestPromise = performRequest();
                inFlightGetRequests.set(requestKey, requestPromise);

                try {
                    const response = await requestPromise;
                    return response.clone();
                } finally {
                    inFlightGetRequests.delete(requestKey);
                }
            }

            return await performRequest();
        } catch (error) {
            console.error('API Request failed:', error);
            throw error;
        }
    }
};
