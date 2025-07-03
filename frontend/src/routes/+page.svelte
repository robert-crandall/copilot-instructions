<script lang="ts">
	import { authStore, type User } from '$lib/stores/auth';
	import Navigation from '$lib/components/Navigation.svelte';

	let user: User | null = null;
	let token: string | null = null;
	let loading = false;

	// Subscribe to auth store
	authStore.subscribe((state) => {
		user = state.user;
		token = state.token;
		loading = state.loading;
	});
</script>

<svelte:head>
	<title>Home | Auth Template</title>
</svelte:head>

<div class="min-h-screen bg-gradient-to-br from-base-100 to-base-200">
	<!-- Main content -->
	<main class="flex flex-1 flex-col items-center justify-center px-6 py-20">
		{#if user}
			<!-- Logged-in View -->
			<section class="flex w-full max-w-2xl flex-col items-center">
				<div class="hero-content text-center mb-8">
					<div>
						<h1 class="text-4xl font-bold text-gradient mb-3">
							Welcome back, {user.name}!
						</h1>
						<p class="text-base-content/70 max-w-lg text-xl">
							You're successfully logged in to your account.
						</p>
					</div>
				</div>

				<div class="card w-full bg-base-100 shadow-xl">
					<div class="card-body">
						<div class="flex items-center gap-4 mb-4">
							<div class="avatar placeholder">
								<div class="bg-primary text-primary-content rounded-full w-16 h-16">
									<span class="text-2xl font-bold">{user.name[0]}</span>
								</div>
							</div>
							<div>
								<h2 class="card-title text-2xl">{user.name}</h2>
								<p class="text-base-content/70">{user.email}</p>
							</div>
						</div>

						<div class="divider"></div>

						<h3 class="text-sm font-semibold uppercase text-base-content/50 mb-3">
							Account Information
						</h3>
						
						<div class="grid grid-cols-1 gap-4 md:grid-cols-2">
							<div class="stat bg-base-200/50 rounded-lg">
								<div class="stat-title text-xs">Username</div>
								<div class="stat-value text-lg">{user.name}</div>
							</div>
							<div class="stat bg-base-200/50 rounded-lg">
								<div class="stat-title text-xs">Email</div>
								<div class="stat-value text-lg">{user.email}</div>
							</div>
							<div class="stat bg-base-200/50 rounded-lg">
								<div class="stat-title text-xs">Status</div>
								<div class="stat-value text-lg flex items-center gap-2">
									<span class="badge badge-success badge-sm"></span>
									Active
								</div>
							</div>
							<div class="stat bg-base-200/50 rounded-lg">
								<div class="stat-title text-xs">Joined</div>
								<div class="stat-value text-lg">{new Date().toLocaleDateString()}</div>
							</div>
						</div>

						<div class="card-actions justify-center mt-6">
							<a href="/hello" class="btn btn-primary btn-wide">
								View Hello World Example
								<svg
									xmlns="http://www.w3.org/2000/svg"
									width="18"
									height="18"
									viewBox="0 0 24 24"
									fill="none"
									stroke="currentColor"
									stroke-width="2"
									stroke-linecap="round"
									stroke-linejoin="round"
									class="w-4 h-4"
								>
									<path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
									<polyline points="15 3 21 3 21 9" />
									<line x1="10" x2="21" y1="14" y2="3" />
								</svg>
							</a>
						</div>
					</div>
				</div>
			</section>
		{:else}
			<!-- Landing Page View -->
			<section class="hero">
				<div class="hero-content flex-col lg:flex-row-reverse max-w-5xl">
					<!-- Right side illustration/image -->
					<div class="flex flex-1 items-center justify-center">
						<div class="mockup-browser bg-base-300 border max-w-sm">
							<div class="mockup-browser-toolbar">
								<div class="input">auth-template.dev</div>
							</div>
							<div class="flex justify-center bg-base-200">
								<div class="flex flex-col gap-3 p-4 w-full">
									<div class="skeleton h-8 w-3/4"></div>
									<div class="skeleton h-4 w-1/2"></div>
									<div class="skeleton h-4 w-2/3"></div>
									<div class="flex gap-2 mt-4">
										<div class="btn btn-primary btn-sm flex-1">Get Started</div>
										<div class="btn btn-outline btn-sm">Login</div>
									</div>
									<div class="skeleton h-32 w-full mt-4"></div>
								</div>
							</div>
						</div>
					</div>

					<!-- Left side content -->
					<div class="max-w-xl flex-1">
						<h1 class="text-5xl font-bold leading-tight mb-4">
							<span class="text-gradient">
								Modern Auth Template
							</span>
						</h1>
						<p class="text-base-content/80 mb-8 text-xl">
							A sleek SvelteKit application with user authentication powered by Hono backend. The
							perfect starting point for your next project.
						</p>
						
						<div class="flex items-center gap-4 mb-8">
							<a href="/register" class="btn btn-primary btn-lg">
								Get Started
								<svg
									xmlns="http://www.w3.org/2000/svg"
									width="18"
									height="18"
									viewBox="0 0 24 24"
									fill="none"
									stroke="currentColor"
									stroke-width="2"
									stroke-linecap="round"
									stroke-linejoin="round"
									class="w-4 h-4"
								>
									<path d="M5 12h14" />
									<path d="m12 5 7 7-7 7" />
								</svg>
							</a>
							<a href="/login" class="btn btn-outline btn-lg">
								Login
							</a>
						</div>

						<!-- Feature badges -->
						<div class="flex flex-wrap gap-3">
							<div class="badge badge-primary">Type-Safe</div>
							<div class="badge badge-secondary">SvelteKit</div>
							<div class="badge badge-accent">Hono Backend</div>
							<div class="badge badge-success">JWT Auth</div>
						</div>
					</div>
				</div>
			</section>
		{/if}
	</main>
</div>
