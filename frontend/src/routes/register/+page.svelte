<script lang="ts">
	import RegisterForm from '$lib/components/auth/RegisterForm.svelte';
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';
	import { authApi } from '$lib/api/auth';
	import { authStore } from '$lib/stores/auth';

	let loading = false;
	let error: string | null = null;
	let registrationEnabled = true;

	// Check if registration is enabled
	onMount(async () => {
		try {
			const status = await authApi.getRegistrationStatus();
			registrationEnabled = status.enabled;
		} catch (err) {
			console.error('Failed to check registration status', err);
		}
	});

	// Handle registration
	async function handleRegister(
		event: CustomEvent<{ name: string; email: string; password: string }>
	) {
		loading = true;
		error = null;
		authStore.setLoading(true);

		try {
			const response = await authApi.register(event.detail);

			// Update auth store with user and token
			authStore.setAuth(response.user, response.token);

			// Redirect to home page or dashboard
			goto('/');
		} catch (err) {
			console.error('Registration error:', err);
			const errorMessage =
				err instanceof Error ? err.message : 'An unexpected error occurred. Please try again.';
			error = errorMessage;
			authStore.setError(errorMessage);
			loading = false;
		}
	}
</script>

<svelte:head>
	<title>Register | Auth Template</title>
</svelte:head>

<div class="flex min-h-screen items-center justify-center">
	<div class="w-full max-w-md">
		<RegisterForm {loading} {error} {registrationEnabled} on:register={handleRegister} />
	</div>
</div>
