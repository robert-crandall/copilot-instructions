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

<div class="min-h-screen bg-base-200">
	<!-- Main content -->
	<main class="flex flex-1 flex-col items-center justify-center px-6 py-20">
		{#if user}
			<!-- Logged-in View -->
			<section class="flex w-full max-w-2xl flex-col items-center">
				<div class="mb-8 text-center">
					<h1
						class="mb-3 bg-gradient-to-r from-primary to-secondary bg-clip-text text-4xl font-bold text-transparent"
					>
						Welcome back, {user.name}!
					</h1>
					<p class="text-base-content/70 max-w-lg text-xl">
						You're successfully logged in to your account.
					</p>
				</div>

				<div
					class="card bg-base-100 w-full shadow-xl"
				>
					<div class="card-body">
						<div class="flex items-center gap-4">
							<div
								class="avatar placeholder"
							>
								<div class="bg-primary text-primary-content rounded-full w-16">
									<span class="text-2xl font-bold uppercase">{user.name[0]}</span>
								</div>
							</div>
							<div>
								<h2 class="card-title text-2xl">{user.name}</h2>
								<p class="text-base-content/70">{user.email}</p>
							</div>
						</div>

						<div class="divider">Account Information</div>
						<div class="grid grid-cols-1 gap-4 md:grid-cols-2">
							<div class="stat bg-base-200 rounded-lg">
								<div class="stat-title">Username</div>
								<div class="stat-value text-lg">{user.name}</div>
							</div>
							<div class="stat bg-base-200 rounded-lg">
								<div class="stat-title">Email</div>
								<div class="stat-value text-lg">{user.email}</div>
							</div>
							<div class="stat bg-base-200 rounded-lg">
								<div class="stat-title">Status</div>
								<div class="stat-value text-lg flex items-center gap-2">
									<div class="badge badge-success gap-2">
										<div class="w-2 h-2 rounded-full bg-success"></div>
										Active
									</div>
								</div>
							</div>
							<div class="stat bg-base-200 rounded-lg">
								<div class="stat-title">Joined</div>
								<div class="stat-value text-lg">{new Date().toLocaleDateString()}</div>
							</div>
						</div>

						<div class="card-actions justify-center mt-6">
							<a
								href="/hello"
								class="btn btn-primary btn-wide"
							>
								<span>View Hello World Example</span>
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
									class="lucide lucide-external-link"
									><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" /><polyline
										points="15 3 21 3 21 9"
									/><line x1="10" x2="21" y1="14" y2="3" /></svg
								>
							</a>
						</div>
					</div>
				</div>
			</section>
		{:else}
			<!-- Landing Page View -->
			<section
				class="flex w-full max-w-5xl flex-col items-center justify-between gap-12 md:flex-row"
			>
				<!-- Left side content -->
				<div class="max-w-xl flex-1">
					<h1 class="mb-4 text-5xl leading-tight font-bold">
						<span
							class="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent"
						>
							Modern Auth Template
						</span>
					</h1>
					<p class="text-base-content/80 mb-8 text-xl">
						A sleek SvelteKit application with user authentication powered by Hono backend. The
						perfect starting point for your next project.
					</p>
					<div class="flex items-center gap-4">
						<a
							href="/register"
							class="btn btn-primary btn-lg"
						>
							<span>Get Started</span>
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
								class="lucide lucide-arrow-right"
								><path d="M5 12h14" /><path d="m12 5 7 7-7 7" /></svg
							>
						</a>
						<a
							href="/login"
							class="btn btn-outline btn-lg"
						>
							Login
						</a>
					</div>

					<!-- Feature badges -->
					<div class="mt-8 flex flex-wrap gap-3">
						<div class="badge badge-info">Type-Safe</div>
						<div class="badge badge-secondary">SvelteKit</div>
						<div class="badge badge-success">Hono Backend</div>
						<div class="badge badge-warning">JWT Auth</div>
					</div>
				</div>

				<!-- Right side illustration/image -->
				<div class="flex flex-1 items-center justify-center">
					<div class="relative aspect-square w-full max-w-sm">
						<!-- Abstract shapes for visual interest -->
						<div
							class="absolute top-0 right-0 h-48 w-48 rounded-full bg-primary/10 blur-2xl"
						></div>
						<div
							class="absolute bottom-0 left-0 h-64 w-64 rounded-full bg-secondary/10 blur-2xl"
						></div>

						<!-- App mockup -->
						<div
							class="mockup-window border bg-base-100 relative z-10 shadow-2xl"
						>
							<!-- Mockup content -->
							<div class="flex flex-col gap-3 p-4 bg-base-200">
								<div class="skeleton h-8 w-3/4"></div>
								<div class="skeleton h-4 w-1/2"></div>
								<div class="skeleton h-4 w-2/3"></div>
								<div class="mt-4 flex gap-2">
									<div class="btn btn-primary btn-sm w-1/2">Primary</div>
									<div class="skeleton h-10 w-1/4"></div>
								</div>
								<div class="skeleton mt-4 flex-1"></div>
							</div>
						</div>
					</div>
				</div>
			</section>
		{/if}
	</main>
</div>
