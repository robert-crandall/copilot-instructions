<script lang="ts">
	import { authStore, type User } from '$lib/stores/auth';
	import { goto } from '$app/navigation';

	let user: User | null = null;
	let token: string | null = null;

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

<header class="border-b border-base-200/60 bg-base-100 px-6 py-3 flex items-center justify-between shadow-sm sticky top-0 z-30 backdrop-blur-sm bg-base-100/90">
	<a href="/" class="flex items-center gap-2 text-xl font-semibold text-base-content hover:opacity-80">
		<span class="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-500">Auth Template</span>
	</a>
	<nav class="flex items-center gap-4">
		{#if user}
			<div class="relative group">
				<button class="flex items-center gap-2 px-4 py-2 rounded-full hover:bg-base-200 transition text-base-content font-medium">
					<span class="font-medium">{user.name}</span>
					<div class="w-6 h-6 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-medium uppercase">
						{user.name[0]}
					</div>
					<svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-chevron-down"><path d="m6 9 3 3 3-3"/></svg>
				</button>
				<ul class="absolute right-0 mt-2 w-52 bg-base-100 border border-base-200 rounded-xl shadow-lg py-1.5 opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto transition-all translate-y-2 group-hover:translate-y-0 z-10">
					<li class="px-3 py-2 text-xs text-base-content/60 border-b border-base-200 mb-1">
						Signed in as <span class="font-semibold text-base-content">{user.email}</span>
					</li>
					<li>
						<button class="w-full text-left px-4 py-2 hover:bg-base-200 text-base-content flex items-center gap-2 group/item" on:click={handleLogout}>
							<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-base-content/70 group-hover/item:text-red-500"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
							Sign out
						</button>
					</li>
				</ul>
			</div>
		{:else}
			<a href="/login" class="px-4 py-2 font-medium text-base-content hover:text-blue-600 transition">Login</a>
			<a href="/register" class="px-5 py-2 bg-gradient-to-br from-blue-500 to-purple-600 text-white font-medium rounded-full shadow-sm hover:shadow transition-all hover:scale-105 active:scale-95">Register</a>
		{/if}
	</nav>
</header>
