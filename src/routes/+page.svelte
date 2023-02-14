<script lang="ts">
    import { browser } from '$app/environment'
    import { PullToRefresh } from '../lib'

    let platform: 'android' | 'ios' = 'android'
    let eventTarget: Window
    let screenHeight = 0

    function togglePlatform(): void {
        platform = platform === 'android' ? 'ios' : 'android'
    }

    async function callback(): Promise<void> {
        if (browser) {
            void window.location.reload()
        }
    }

    if (browser) {
        eventTarget = window
        screenHeight = window.screen.availHeight
    }
</script>

<mobile-container>
    <PullToRefresh {platform} {callback} {eventTarget} {screenHeight} />
    <h1>Pull to refresh</h1>
    <p>{platform}</p>
    <button type="button" on:click={togglePlatform}>Toggle platform</button>
</mobile-container>

<style lang="scss">
    mobile-container {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        width: 360px;
        height: 800px;
    }
</style>
