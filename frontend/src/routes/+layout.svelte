<script lang="ts">
	import '../app.css';
	import { onMount } from 'svelte';
	import { authStore } from '$lib/stores/auth';
	import { browser } from '$app/environment';

	let { children } = $props();

	// Initialize auth store on mount
	onMount(() => {
		if (browser) {
			const token = localStorage.getItem('token');
			if (token) {
				// TODO: Validate token with backend and get user info
				// For now, just mark as initialized
				authStore.setInitialized(true);
			} else {
				authStore.setInitialized(true);
			}
		}
	});
</script>

<div class="antialiased min-h-screen flex flex-col">
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
