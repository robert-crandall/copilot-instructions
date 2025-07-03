<script lang="ts">
	import { onMount } from 'svelte';
	import { browser } from '$app/environment';

	type Theme = 'light' | 'dark' | 'dim' | 'system';
	
	let currentTheme: Theme = 'system';
	let isOpen = false;

	// Theme options with their display names and icons
	const themes = [
		{ value: 'light' as Theme, label: 'Light', icon: '☀️' },
		{ value: 'dark' as Theme, label: 'Dark', icon: '🌙' },
		{ value: 'dim' as Theme, label: 'Dim', icon: '🌫️' },
		{ value: 'system' as Theme, label: 'System', icon: '💻' }
	];

	// Get system theme preference
	function getSystemTheme(): 'light' | 'dark' {
		if (!browser) return 'light';
		return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
	}

	// Apply theme to document
	function applyTheme(theme: Theme) {
		if (!browser) return;
		
		let actualTheme: 'light' | 'dark' | 'dim';
		
		if (theme === 'system') {
			actualTheme = getSystemTheme();
		} else {
			actualTheme = theme;
		}
		
		document.documentElement.setAttribute('data-theme', actualTheme);
	}

	// Set theme and save to localStorage
	function setTheme(theme: Theme) {
		currentTheme = theme;
		applyTheme(theme);
		
		if (browser) {
			localStorage.setItem('theme', theme);
		}
		
		isOpen = false;
	}

	// Listen for system theme changes
	function setupSystemThemeListener() {
		if (!browser) return;
		
		const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
		mediaQuery.addEventListener('change', () => {
			if (currentTheme === 'system') {
				applyTheme('system');
			}
		});
	}

	// Initialize theme on mount
	onMount(() => {
		if (browser) {
			// Get saved theme or default to system
			const savedTheme = localStorage.getItem('theme') as Theme;
			currentTheme = savedTheme && themes.find(t => t.value === savedTheme) ? savedTheme : 'system';
			
			applyTheme(currentTheme);
			setupSystemThemeListener();
		}
	});

	// Get current theme for display
	$: displayTheme = currentTheme === 'system' ? getSystemTheme() : currentTheme;
	$: currentThemeData = themes.find(t => t.value === currentTheme) || themes[3];
</script>

<!-- Theme Switcher Dropdown -->
<div class="dropdown dropdown-end">
	<div tabindex="0" role="button" class="btn btn-ghost btn-circle" aria-label="Switch theme">
		<span class="text-lg">{currentThemeData.icon}</span>
	</div>
	<ul class="dropdown-content menu bg-base-100 rounded-box z-[1] w-52 p-2 shadow" role="menu">
		{#each themes as theme}
			<li>
				<button
					class="flex items-center gap-3 p-2 rounded-lg hover:bg-base-200 transition-colors"
					class:bg-base-200={currentTheme === theme.value}
					on:click={() => setTheme(theme.value)}
				>
					<span class="text-lg">{theme.icon}</span>
					<span class="flex-1 text-left">{theme.label}</span>
					{#if currentTheme === theme.value}
						<span class="text-primary">✓</span>
					{/if}
				</button>
			</li>
		{/each}
	</ul>
</div>