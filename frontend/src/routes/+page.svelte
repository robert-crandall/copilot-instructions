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

<div class="min-h-screen bg-gradient-to-br from-base-100 to-base-200/30 flex flex-col">
	<!-- Navigation Component -->
	<Navigation />

	<!-- Main content -->
	<main class="flex-1 flex flex-col items-center justify-center px-6 py-20">
		{#if user}
			<!-- Logged-in View -->
			<section class="w-full max-w-2xl flex flex-col items-center">
				<div class="mb-8 text-center">
					<h1 class="text-4xl font-bold mb-3 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">
						Welcome back, {user.name}!
					</h1>
					<p class="text-xl text-base-content/70 max-w-lg">
						You're successfully logged in to your account.
					</p>
				</div>

				<div class="w-full bg-base-100 rounded-xl shadow-lg border border-base-200/60 backdrop-blur-sm overflow-hidden">
					<div class="p-6 flex flex-col gap-4">
						<div class="flex items-center gap-4">
							<div class="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white text-2xl font-bold uppercase">
								{user.name[0]}
							</div>
							<div>
								<h2 class="text-2xl font-bold">{user.name}</h2>
								<p class="text-base-content/70">{user.email}</p>
							</div>
						</div>
						
						<div class="mt-4 border-t border-base-200 pt-4">
							<h3 class="text-sm uppercase font-semibold text-base-content/50 mb-3">Account Information</h3>
							<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
								<div class="bg-base-200/50 rounded-lg p-4">
									<span class="text-xs text-base-content/60 block mb-1">Username</span>
									<span class="font-medium">{user.name}</span>
								</div>
								<div class="bg-base-200/50 rounded-lg p-4">
									<span class="text-xs text-base-content/60 block mb-1">Email</span>
									<span class="font-medium">{user.email}</span>
								</div>
								<div class="bg-base-200/50 rounded-lg p-4">
									<span class="text-xs text-base-content/60 block mb-1">Status</span>
									<div class="flex items-center gap-2">
										<div class="w-2 h-2 rounded-full bg-green-500"></div>
										<span class="font-medium">Active</span>
									</div>
								</div>
								<div class="bg-base-200/50 rounded-lg p-4">
									<span class="text-xs text-base-content/60 block mb-1">Joined</span>
									<span class="font-medium">{new Date().toLocaleDateString()}</span>
								</div>
							</div>
						</div>
					</div>
				</div>
			</section>
		{:else}
			<!-- Landing Page View -->
			<section class="w-full max-w-5xl flex flex-col md:flex-row items-center justify-between gap-12">
				<!-- Left side content -->
				<div class="flex-1 max-w-xl">
					<h1 class="text-5xl font-bold leading-tight mb-4">
						<span class="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">
							Modern Auth Template
						</span>
					</h1>
					<p class="text-xl mb-8 text-base-content/80">
						A sleek SvelteKit application with user authentication powered by Hono backend. The perfect starting point for your next project.
					</p>
					<div class="flex items-center gap-4">
						<a href="/register" class="px-8 py-3 bg-gradient-to-br from-blue-500 to-purple-600 text-white font-medium rounded-full shadow-lg hover:shadow-xl transition-all hover:scale-105 active:scale-95 flex items-center gap-2">
							<span>Get Started</span>
							<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-arrow-right"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
						</a>
						<a href="/login" class="px-8 py-3 bg-base-100 border border-base-300 text-base-content font-medium rounded-full shadow-sm hover:shadow transition-all hover:border-blue-400">
							Login
						</a>
					</div>
					
					<!-- Feature badges -->
					<div class="flex flex-wrap gap-3 mt-8">
						<div class="bg-blue-100 text-blue-800 text-xs px-3 py-1 rounded-full">
							Type-Safe
						</div>
						<div class="bg-purple-100 text-purple-800 text-xs px-3 py-1 rounded-full">
							SvelteKit
						</div>
						<div class="bg-emerald-100 text-emerald-800 text-xs px-3 py-1 rounded-full">
							Hono Backend
						</div>
						<div class="bg-amber-100 text-amber-800 text-xs px-3 py-1 rounded-full">
							JWT Auth
						</div>
					</div>
				</div>
				
				<!-- Right side illustration/image -->
				<div class="flex-1 flex justify-center items-center">
					<div class="relative w-full max-w-sm aspect-square">
						<!-- Abstract shapes for visual interest -->
						<div class="absolute top-0 right-0 w-48 h-48 bg-blue-500/10 rounded-full blur-2xl"></div>
						<div class="absolute bottom-0 left-0 w-64 h-64 bg-purple-500/10 rounded-full blur-2xl"></div>
						
						<!-- App mockup -->
						<div class="relative z-10 w-full h-full rounded-2xl shadow-2xl overflow-hidden border border-base-200/60 flex flex-col bg-base-100">
							<!-- Mockup header -->
							<div class="h-14 border-b border-base-200 flex items-center px-4 gap-3 bg-base-100">
								<div class="w-3 h-3 rounded-full bg-red-400"></div>
								<div class="w-3 h-3 rounded-full bg-yellow-400"></div>
								<div class="w-3 h-3 rounded-full bg-green-400"></div>
								<div class="ml-4 flex-1 h-5 bg-base-200 rounded-full"></div>
							</div>
							
							<!-- Mockup content -->
							<div class="flex-1 p-4 flex flex-col gap-3">
								<div class="h-8 w-3/4 bg-base-200 rounded-lg"></div>
								<div class="h-4 w-1/2 bg-base-200 rounded-lg"></div>
								<div class="h-4 w-2/3 bg-base-200 rounded-lg"></div>
								<div class="flex gap-2 mt-4">
									<div class="h-10 w-1/2 bg-blue-500 rounded-lg"></div>
									<div class="h-10 w-1/4 bg-base-200 rounded-lg"></div>
								</div>
								<div class="flex-1 mt-4 bg-base-200 rounded-lg"></div>
							</div>
						</div>
					</div>
				</div>
			</section>
		{/if}
	</main>
</div>
