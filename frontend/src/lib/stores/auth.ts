import { writable } from 'svelte/store';
import { browser } from '$app/environment';
import type { PublicUser } from 'types';

// Use the shared PublicUser type instead of defining our own
// This ensures consistency across frontend and backend

// Authentication store state
interface AuthState {
	user: PublicUser | null;
	token: string | null;
	loading: boolean;
	error: string | null;
	initialized: boolean;
}

// Create the authentication store
function createAuthStore() {
	// Get initial token from localStorage
	const initialToken = browser ? localStorage.getItem('token') : null;

	// Initial state
	const initialState: AuthState = {
		user: null,
		token: initialToken,
		loading: false,
		error: null,
		initialized: false
	};

	const { subscribe, set, update } = writable<AuthState>(initialState);

	return {
		subscribe,

		// Set the user and token after successful authentication
		setAuth: (user: PublicUser, token: string) => {
			if (browser) {
				localStorage.setItem('token', token);
			}

			update((state) => ({
				...state,
				user,
				token,
				loading: false,
				error: null,
				initialized: true
			}));
		},

		// Clear authentication state on logout
		clearAuth: () => {
			if (browser) {
				localStorage.removeItem('token');
			}

			update((state) => ({
				...state,
				user: null,
				token: null,
				loading: false,
				error: null,
				initialized: true
			}));
		},

		// Set loading state
		setLoading: (isLoading: boolean) => {
			update((state) => ({ ...state, loading: isLoading }));
		},

		// Set error state
		setError: (errorMessage: string | null) => {
			update((state) => ({ ...state, error: errorMessage, loading: false }));
		},

		// Set initialized state
		setInitialized: (initialized: boolean = true) => {
			update((state) => ({ ...state, initialized }));
		}
	};
}

// Export the authentication store
export const authStore = createAuthStore();
