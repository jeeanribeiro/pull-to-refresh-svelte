<script lang="ts">
	import { PullToRefresh } from '$lib/index.js';
	import type { ResolvedPlatform } from '$lib/types.js';

	let { platform, label }: { platform: ResolvedPlatform; label: string } = $props();

	interface FeedItem {
		id: number;
		title: string;
		body: string;
		time: string;
	}

	const seed: FeedItem[] = [
		{ id: 1, title: 'Weekly digest', body: 'Nine things you missed this week', time: '09:41' },
		{ id: 2, title: 'Deploy finished', body: 'production is live in 3 regions', time: '09:12' },
		{ id: 3, title: 'New follower', body: 'someone starred your repository', time: '08:56' },
		{ id: 4, title: 'Standup notes', body: 'gesture handling shipped yesterday', time: '08:30' },
		{ id: 5, title: 'Release drafted', body: 'v1.0.0 notes are ready for review', time: '08:02' },
		{ id: 6, title: 'CI is green', body: 'all 24 tests passing on main', time: '07:45' },
		{ id: 7, title: 'Design review', body: 'the spinner motion feels native', time: '07:20' },
		{ id: 8, title: 'Docs updated', body: 'recipes for page and list refresh', time: '07:11' },
		{ id: 9, title: 'Issue closed', body: 'SSR crash fixed by lazy measurement', time: '06:58' },
		{ id: 10, title: 'Benchmarks', body: 'zero dependencies, tiny footprint', time: '06:42' },
		{ id: 11, title: 'Night build', body: 'packaged types look correct', time: '06:15' },
		{ id: 12, title: 'Good morning', body: 'pull down to fetch something new', time: '06:00' }
	];

	let count = $state(0);
	let items = $state<FeedItem[]>(seed);

	async function refresh(): Promise<void> {
		await new Promise((resolve) => setTimeout(resolve, 1200));
		count += 1;
		const now = new Date();
		const hh = String(now.getHours()).padStart(2, '0');
		const mm = String(now.getMinutes()).padStart(2, '0');
		items = [
			{
				id: Date.now(),
				title: `Refreshed (#${count})`,
				body: 'this item arrived via pull-to-refresh',
				time: `${hh}:${mm}`
			},
			...items
		];
	}
</script>

<figure class="phone" data-testid="phone-{platform}">
	<div class="screen">
		<div class="notch" aria-hidden="true"></div>
		<header class="appbar">
			<span class="appbar-title">{label}</span>
			<span class="count" data-testid="refresh-count-{platform}">{count}</span>
		</header>
		<PullToRefresh {platform} onrefresh={refresh} threshold={70} class="demo-ptr">
			<ul class="feed" data-testid="feed-{platform}">
				{#each items as item (item.id)}
					<li>
						<div class="row">
							<span class="title">{item.title}</span>
							<span class="time">{item.time}</span>
						</div>
						<p class="body">{item.body}</p>
					</li>
				{/each}
			</ul>
		</PullToRefresh>
	</div>
	<figcaption class="sr-only">{label} pull-to-refresh demo</figcaption>
</figure>

<style>
	.phone {
		background: #0b0d12;
		border-radius: 44px;
		box-shadow:
			0 0 0 2px #2a2f3a,
			0 24px 60px rgba(0, 0, 0, 0.45);
		flex-shrink: 0;
		margin: 0;
		padding: 12px;
		user-select: none;
		width: 320px;
	}

	.screen {
		background: #f4f2ee;
		border-radius: 34px;
		display: flex;
		flex-direction: column;
		height: 584px;
		overflow: hidden;
		position: relative;
	}

	.notch {
		background: #0b0d12;
		border-radius: 999px;
		height: 24px;
		left: 50%;
		position: absolute;
		top: 10px;
		transform: translateX(-50%);
		width: 110px;
		z-index: 10;
	}

	.appbar {
		align-items: flex-end;
		background: linear-gradient(#fbfaf8, #f4f2ee);
		display: flex;
		flex-shrink: 0;
		height: 84px;
		justify-content: space-between;
		padding: 0 20px 10px;
	}

	.appbar-title {
		color: #1c2026;
		font-size: 1.05rem;
		font-weight: 700;
	}

	.count {
		background: #4169e1;
		border-radius: 999px;
		color: #fff;
		font-size: 0.75rem;
		font-weight: 700;
		min-width: 1.6rem;
		padding: 0.15rem 0.45rem;
		text-align: center;
	}

	:global(.demo-ptr) {
		flex: 1;
		min-height: 0;
	}

	.feed {
		height: 100%;
		list-style: none;
		margin: 0;
		overflow-y: auto;
		overscroll-behavior-y: contain;
		padding: 0;
	}

	.feed li {
		background: #fff;
		border-bottom: 1px solid #eceae5;
		padding: 12px 20px;
		text-align: left;
	}

	.row {
		display: flex;
		justify-content: space-between;
	}

	.title {
		color: #1c2026;
		font-size: 0.9rem;
		font-weight: 600;
	}

	.time {
		color: #9aa0aa;
		font-size: 0.75rem;
	}

	.body {
		color: #5c6470;
		font-size: 0.8rem;
		margin: 2px 0 0;
	}

	.sr-only {
		clip-path: inset(50%);
		height: 1px;
		overflow: hidden;
		position: absolute;
		width: 1px;
	}
</style>
