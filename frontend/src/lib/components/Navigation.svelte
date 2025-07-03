<script lang="ts">
	import { authStore, type User } from '$lib/stores/auth';
	import { goto } from '$app/navigation';
	import ThemeSwitcher from './ThemeSwitcher.svelte';

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

<header
	class="navbar bg-base-100 border-b border-base-300 shadow-sm"
>
	<div class="navbar-start">
		<a
			href="/"
			class="btn btn-ghost text-xl font-semibold"
		>
			<span class="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent"
				>Auth Template</span
			>
		</a>
	</div>
	
	<div class="navbar-end">
		<div class="flex items-center gap-2">
			<!-- Theme Switcher -->
			<ThemeSwitcher />
			
			{#if user}
				<a
					href="/hello"
					class="btn btn-ghost"
					>Hello World</a
				>

				<!-- User Menu Dropdown -->
				<div class="dropdown dropdown-end">
					<div tabindex="0" role="button" class="btn btn-ghost btn-circle avatar">
						<div class="w-8 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-primary-content font-bold text-sm">
							{user.name[0].toUpperCase()}
						</div>
					</div>
					<ul class="menu menu-sm dropdown-content mt-3 z-[1] p-2 shadow bg-base-100 rounded-box w-52" role="menu">
						<li class="menu-title">
							<span>Signed in as {user.email}</span>
						</li>
						<li>
							<button
								class="text-error"
								on:click={handleLogout}
							>
								<!-- Lucide LogOut Icon -->
								<svg
									xmlns="http://www.w3.org/2000/svg"
									width="20"
									height="20"
									fill="none"
									stroke="currentColor"
									stroke-width="2"
									stroke-linecap="round"
									stroke-linejoin="round"
									class="lucide lucide-log-out"
									><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline
										points="16 17 21 12 16 7"
									/><line x1="21" y1="12" x2="9" y2="12" /></svg
								>
								Sign out
							</button>
						</li>
					</ul>
				</div>
			{:else}
				<a
					href="/login"
					class="btn btn-ghost">Login</a
				>
				<a
					href="/register"
					class="btn btn-primary"
					>Register</a
				>
			{/if}
		</div>
	</div>
</header>
