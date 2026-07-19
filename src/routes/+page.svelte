<script lang="ts">
	import { base } from '$app/paths';
	import PhoneDemo from './PhoneDemo.svelte';
</script>

<svelte:head>
	<title>pull-to-refresh-svelte — native-feeling pull to refresh for Svelte 5</title>
	<meta
		name="description"
		content="Pull-to-refresh for Svelte 5 with pixel-faithful iOS and Material indicators. SSR-safe, pointer events, custom indicator snippets."
	/>
</svelte:head>

<div class="min-h-screen bg-[#11141b] text-[#e8eaf0]">
	<main class="mx-auto max-w-5xl px-6 py-12">
		<header class="mb-10 text-center">
			<p class="mb-3 text-sm font-semibold tracking-widest text-[#7aa2ff] uppercase">
				Svelte 5 component
			</p>
			<h1 class="text-4xl font-extrabold tracking-tight sm:text-5xl">pull-to-refresh-svelte</h1>
			<p class="mx-auto mt-4 max-w-2xl text-lg text-[#9aa3b5]">
				Native-feeling pull to refresh with pixel-faithful iOS and Material indicators. SSR-safe,
				driven by pointer events, themeable, and open to fully custom indicators via snippets.
			</p>
			<div class="mt-6 flex flex-wrap items-center justify-center gap-3">
				<code class="rounded-lg bg-[#1c212c] px-4 py-2 font-mono text-sm text-[#9ecbff]">
					npm install pull-to-refresh-svelte
				</code>
				<a
					class="rounded-lg border border-[#2a3140] px-4 py-2 text-sm font-semibold text-[#e8eaf0] transition hover:border-[#4169e1] hover:text-white"
					href="https://github.com/jeeanribeiro/pull-to-refresh-svelte"
				>
					GitHub →
				</a>
			</div>
			<p class="mt-6 text-sm text-[#6b7485]">
				Pull a feed down — with a finger, or a mouse. Release past the threshold to refresh.
			</p>
		</header>

		<section class="flex flex-wrap items-start justify-center gap-10">
			<div class="text-center">
				<h2 class="mb-4 text-sm font-bold tracking-widest text-[#9aa3b5] uppercase">iOS</h2>
				<PhoneDemo platform="ios" label="Inbox" />
			</div>
			<div class="text-center">
				<h2 class="mb-4 text-sm font-bold tracking-widest text-[#9aa3b5] uppercase">Material</h2>
				<PhoneDemo platform="material" label="Updates" />
			</div>
		</section>

		<section class="mx-auto mt-14 grid max-w-3xl gap-4 sm:grid-cols-3">
			<div class="rounded-xl border border-[#232a38] bg-[#161a23] p-4">
				<h3 class="font-semibold text-white">Faithful indicators</h3>
				<p class="mt-1 text-sm text-[#9aa3b5]">
					The 12-bar iOS spinner and the self-drawing Material arc, recreated in pure CSS.
				</p>
			</div>
			<div class="rounded-xl border border-[#232a38] bg-[#161a23] p-4">
				<h3 class="font-semibold text-white">Correct gestures</h3>
				<p class="mt-1 text-sm text-[#9aa3b5]">
					Arms only at the top of the nearest scroll container, with direction locking and
					rubber-band resistance.
				</p>
			</div>
			<div class="rounded-xl border border-[#232a38] bg-[#161a23] p-4">
				<h3 class="font-semibold text-white">Yours to theme</h3>
				<p class="mt-1 text-sm text-[#9aa3b5]">
					CSS custom properties for the built-ins, or bring your own indicator as a snippet.
				</p>
			</div>
		</section>

		<section class="mt-14 flex flex-col items-center gap-3">
			<img
				src="{base}/qr.svg"
				alt="QR code linking to this demo"
				class="h-36 w-36 rounded-xl bg-white p-2"
			/>
			<p class="text-sm text-[#6b7485]">Scan to try the real gesture on your phone</p>
		</section>

		<footer class="mt-14 text-center text-sm text-[#6b7485]">
			MIT · built by
			<a class="text-[#7aa2ff] hover:underline" href="https://github.com/jeeanribeiro">
				Jean Ribeiro
			</a>
		</footer>
	</main>
</div>
