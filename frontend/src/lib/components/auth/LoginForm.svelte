<script lang="ts">
	import { createEventDispatcher } from 'svelte';

	// Props
	export let loading = false;
	export let error: string | null = null;

	// Form data
	let email = '';
	let password = '';
	let rememberMe = false;

	// Form validation
	let emailError = '';
	let passwordError = '';
	let formValid = false;

	// Event dispatcher
	const dispatch = createEventDispatcher<{
		login: { email: string; password: string; rememberMe: boolean };
	}>();

	// Validate form input
	function validateEmail() {
		if (!email) {
			emailError = 'Email is required';
			return false;
		}
		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		if (!emailRegex.test(email)) {
			emailError = 'Please enter a valid email address';
			return false;
		}
		emailError = '';
		return true;
	}

	function validatePassword() {
		if (!password) {
			passwordError = 'Password is required';
			return false;
		}
		passwordError = '';
		return true;
	}

	function validateForm() {
		const isEmailValid = validateEmail();
		const isPasswordValid = validatePassword();
		formValid = isEmailValid && isPasswordValid;
		return formValid;
	}

	// Handle form submission
	function handleSubmit() {
		if (validateForm()) {
			dispatch('login', { email, password, rememberMe });
		}
	}
</script>

<div class="mx-auto w-full max-w-md p-4">
	<div class="text-center mb-8">
		<h1 class="text-3xl font-bold mb-2">Welcome back</h1>
		<p class="text-base-content/70">Sign in to continue to your account</p>
	</div>

	{#if error}
		<div class="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded-lg">
			<div class="flex items-start">
				<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-red-500 mt-0.5 mr-3">
					<circle cx="12" cy="12" r="10"/>
					<line x1="12" x2="12" y1="8" y2="12"/>
					<line x1="12" x2="12.01" y1="16" y2="16"/>
				</svg>
				<span class="text-red-700">{error}</span>
			</div>
		</div>
	{/if}

	<form on:submit|preventDefault={handleSubmit} class="space-y-6">
		<div>
			<label for="email" class="block text-sm font-medium mb-2">
				Email address
			</label>
			<input
				type="email"
				id="email"
				bind:value={email}
				on:blur={validateEmail}
				placeholder="you@example.com"
				class="w-full px-4 py-3 rounded-lg border border-base-300 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
				disabled={loading}
				autocomplete="email"
			/>
			{#if emailError}
				<p class="mt-1.5 text-sm text-red-600">{emailError}</p>
			{/if}
		</div>

		<div>
			<div class="flex justify-between items-center mb-2">
				<label for="password" class="block text-sm font-medium">
					Password
				</label>
				<a href="#" class="text-sm text-brand-600 hover:text-brand-500">Forgot password?</a>
			</div>
			<input
				type="password"
				id="password"
				bind:value={password}
				on:blur={validatePassword}
				placeholder="••••••••"
				class="w-full px-4 py-3 rounded-lg border border-base-300 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
				disabled={loading}
				autocomplete="current-password"
			/>
			{#if passwordError}
				<p class="mt-1.5 text-sm text-red-600">{passwordError}</p>
			{/if}
		</div>

		<div class="flex items-center">
			<input
				id="remember"
				type="checkbox"
				bind:checked={rememberMe}
				class="h-4 w-4 rounded border-base-300 text-brand-600 focus:ring-brand-500"
				disabled={loading}
			/>
			<label for="remember" class="ml-2 block text-sm">
				Remember me for 30 days
			</label>
		</div>

		<div>
			<button 
				type="submit" 
				class="hover-lift w-full py-3 bg-gradient-to-br from-brand-500 to-brand-600 text-white font-medium rounded-lg shadow flex items-center justify-center" 
				disabled={loading}
			>
				{#if loading}
					<svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
						<circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
						<path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
					</svg>
				{/if}
				Sign in
			</button>
		</div>

		<div class="mt-6 text-center">
			<p class="text-base-content/70">
				Don't have an account?
				<a href="/register" class="font-medium text-brand-600 hover:text-brand-500">
					Create one now
				</a>
			</p>
		</div>
	</form>
</div>
