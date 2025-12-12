import { storage } from './storage';

const AUTH_KEY = 'auth_state';

// Hardcoded fallback credentials to prevent lockout
const FALLBACK_CREDENTIALS = {
    username: 'sithum',
    password: 'Sithum0213',
};

export interface AuthState {
    isAuthenticated: boolean;
    user: { username: string } | null;
}

export const auth = {
    // Check if user is authenticated
    isAuthenticated: (): boolean => {
        try {
            const authState = localStorage.getItem(AUTH_KEY);
            if (authState) {
                const state: AuthState = JSON.parse(authState);
                return state.isAuthenticated;
            }
            return false;
        } catch {
            return false;
        }
    },

    // Login
    login: (username: string, password: string): boolean => {
        try {
            const data = storage.getData();
            const adminCredentials = data?.settings?.adminCredentials;

            // Check against stored credentials
            if (
                adminCredentials &&
                username === adminCredentials.username &&
                password === adminCredentials.password
            ) {
                const authState: AuthState = {
                    isAuthenticated: true,
                    user: { username },
                };
                localStorage.setItem(AUTH_KEY, JSON.stringify(authState));
                return true;
            }

            // Fallback to hardcoded credentials (prevents lockout)
            if (
                username === FALLBACK_CREDENTIALS.username &&
                password === FALLBACK_CREDENTIALS.password
            ) {
                const authState: AuthState = {
                    isAuthenticated: true,
                    user: { username },
                };
                localStorage.setItem(AUTH_KEY, JSON.stringify(authState));
                console.log('✅ Logged in with fallback credentials');
                return true;
            }

            return false;
        } catch (error) {
            console.error('Login error:', error);

            // If there's any error, try fallback credentials
            if (
                username === FALLBACK_CREDENTIALS.username &&
                password === FALLBACK_CREDENTIALS.password
            ) {
                const authState: AuthState = {
                    isAuthenticated: true,
                    user: { username },
                };
                localStorage.setItem(AUTH_KEY, JSON.stringify(authState));
                console.log('✅ Logged in with fallback credentials (error recovery)');
                return true;
            }

            return false;
        }
    },

    // Logout
    logout: (): void => {
        localStorage.removeItem(AUTH_KEY);
    },

    // Get current user
    getUser: (): { username: string } | null => {
        try {
            const authState = localStorage.getItem(AUTH_KEY);
            if (authState) {
                const state: AuthState = JSON.parse(authState);
                return state.user;
            }
            return null;
        } catch {
            return null;
        }
    },

    // Update admin credentials
    updateCredentials: (username: string, password: string): void => {
        const data = storage.getData();
        data.settings.adminCredentials = { username, password };
        storage.setData(data);

        // Update current auth state
        const authState: AuthState = {
            isAuthenticated: true,
            user: { username },
        };
        localStorage.setItem(AUTH_KEY, JSON.stringify(authState));
    },
};
