<script lang="ts">
	import '../app.css';
	import { onMount } from 'svelte';
	import { authStore } from '$lib/stores/auth';
	import { browser } from '$app/environment';
	import { initializeAuth } from '$lib/services/auth-service';

	let { children } = $props();

	// Initialize auth store on mount
	onMount(async () => {
		if (browser) {
			try {
				await initializeAuth();
			} catch (error) {
				console.error('Failed to initialize authentication:', error);
				authStore.setInitialized(true);
			}
		}
	});
</script>

<div class="flex min-h-screen flex-col antialiased">
	{@render children()}
</div>

<style>
	:global(body) {
		background: linear-gradient(
			to bottom right,
			hsl(210 20% 98%),
			hsl(210 20% 97%),
			hsl(210 20% 95%)
		);
		min-height: 100vh;
	}

	:global(button, a) {
		transition: all 0.2s ease;
	}

	:global(h1, h2, h3, h4, h5, h6) {
		line-height: 1.2;
	}
</style>
