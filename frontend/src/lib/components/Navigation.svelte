<script lang="ts">
import { authStore, type User } from '$lib/stores/auth';
import { goto } from '$app/navigation';
import { onMount } from 'svelte';

let user: User | null = null;
let token: string | null = null;
let menuOpen = false;

// Close menu on outside click
function handleClickOutside(event: MouseEvent) {
	const menu = document.getElementById('nav-menu');
	const button = document.getElementById('nav-menu-btn');
	if (menuOpen && menu && !menu.contains(event.target as Node) && button && !button.contains(event.target as Node)) {
		menuOpen = false;
	}
}

onMount(() => {
	document.addEventListener('mousedown', handleClickOutside);
	return () => document.removeEventListener('mousedown', handleClickOutside);
});

// Subscribe to auth store
authStore.subscribe((state) => {
	user = state.user;
	token = state.token;
});

// Handle logout
function handleLogout() {
	authStore.clearAuth();
	goto('/');
}
</script>

<header
	class="border-base-200/60 bg-base-100 bg-base-100/90 sticky top-0 z-30 flex items-center justify-between border-b px-6 py-3 shadow-sm backdrop-blur-sm"
>
	<a
		href="/"
		class="text-base-content flex items-center gap-2 text-xl font-semibold hover:opacity-80"
	>
		<span class="bg-gradient-to-r from-blue-600 to-purple-500 bg-clip-text text-transparent"
			>Auth Template</span
		>
	</a>
	<nav class="flex items-center gap-4">
		{#if user}
			<a
				href="/hello"
				class="text-base-content px-4 py-2 font-medium transition hover:text-blue-600"
				>Hello World</a
			>

			<!-- Hamburger menu button -->
			<button
				id="nav-menu-btn"
				class="ml-2 flex h-10 w-10 items-center justify-center rounded-full border border-base-200 bg-base-100 text-base-content hover:bg-base-200 focus:outline-none focus:ring-2 focus:ring-primary"
				aria-label={menuOpen ? 'Close menu' : 'Open menu'}
				aria-expanded={menuOpen}
				aria-controls="nav-menu"
				on:click={() => (menuOpen = !menuOpen)}
			>
				{#if !menuOpen}
					<!-- Lucide Menu Icon -->
					<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-menu"><line x1="4" y1="6" x2="20" y2="6"/><line x1="4" y1="12" x2="20" y2="12"/><line x1="4" y1="18" x2="20" y2="18"/></svg>
				{:else}
					<!-- Lucide X Icon -->
					<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-x"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
				{/if}
			</button>

			<!-- Hamburger menu dropdown -->
			{#if menuOpen}
				<ul
					id="nav-menu"
					class="absolute right-6 top-16 z-40 w-64 rounded-xl border border-base-200 bg-base-100 py-2 shadow-lg animate-in fade-in slide-in-from-top-2"
					tabindex="-1"
					aria-label="User menu"
				>
					<li class="text-base-content/60 border-base-200 mb-1 border-b px-3 py-2 text-xs">
						Signed in as <span class="text-base-content font-semibold">{user.email}</span>
					</li>
					<li>
						<button
							class="hover:bg-base-200 text-base-content group/item flex w-full items-center gap-2 px-4 py-2 text-left"
							on:click={handleLogout}
						>
							<!-- Lucide LogOut Icon -->
							<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-log-out text-base-content/70 group-hover/item:text-red-500"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
							Sign out
						</button>
					</li>
				</ul>
			{/if}
		{:else}
			<a
				href="/login"
				class="text-base-content px-4 py-2 font-medium transition hover:text-blue-600">Login</a
			>
			<a
				href="/register"
				class="rounded-full bg-gradient-to-br from-blue-500 to-purple-600 px-5 py-2 font-medium text-white shadow-sm transition-all hover:scale-105 hover:shadow active:scale-95"
				>Register</a
			>
		{/if}
	</nav>
</header>
