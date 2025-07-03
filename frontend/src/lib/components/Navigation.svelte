<script lang="ts">
import { authStore, type User } from '$lib/stores/auth';
import { goto } from '$app/navigation';
import { onMount } from 'svelte';
import ThemeController from './ThemeController.svelte';

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

<header class="navbar bg-base-100 border-b border-base-200 shadow-sm sticky top-0 z-30">
	<div class="navbar-start">
		<a href="/" class="btn btn-ghost text-xl font-semibold text-gradient">
			Auth Template
		</a>
	</div>

	<div class="navbar-end">
		<ThemeController />
		
		{#if user}
			<a href="/hello" class="btn btn-ghost">Hello World</a>

			<!-- User dropdown menu -->
			<div class="dropdown dropdown-end">
				<div
					id="nav-menu-btn"
					tabindex="0"
					role="button"
					class="btn btn-ghost btn-circle avatar"
					aria-label={menuOpen ? 'Close menu' : 'Open menu'}
					on:click={() => (menuOpen = !menuOpen)}
				>
					{#if !menuOpen}
						<!-- Lucide Menu Icon -->
						<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-5 h-5"><line x1="4" y1="6" x2="20" y2="6"/><line x1="4" y1="12" x2="20" y2="12"/><line x1="4" y1="18" x2="20" y2="18"/></svg>
					{:else}
						<!-- Lucide X Icon -->
						<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-5 h-5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
					{/if}
				</div>

				{#if menuOpen}
					<ul
						id="nav-menu"
						tabindex="-1"
						class="dropdown-content menu bg-base-100 rounded-box z-40 w-64 p-2 shadow border border-base-200"
						aria-label="User menu"
					>
						<li class="menu-title">
							<span class="text-xs">Signed in as <strong>{user.email}</strong></span>
						</li>
						<div class="divider my-2"></div>
						<li>
							<button class="text-error hover:bg-error hover:text-error-content" on:click={handleLogout}>
								<!-- Lucide LogOut Icon -->
								<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-4 h-4"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
								Sign out
							</button>
						</li>
					</ul>
				{/if}
			</div>
		{:else}
			<a href="/login" class="btn btn-ghost">Login</a>
			<a href="/register" class="btn btn-primary">Register</a>
		{/if}
	</div>
</header>
