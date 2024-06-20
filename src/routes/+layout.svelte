<script lang="ts">
import { dev } from '$app/environment'
import { inject } from '@vercel/analytics'
import { injectSpeedInsights } from '@vercel/speed-insights/sveltekit'
import { env } from '$env/dynamic/private'
import '../app.css'

injectSpeedInsights()
inject({ mode: dev ? 'development' : 'production' })

const { children, data } = $props()

const openLoginPage = () => {
  open(
    `https://www.bungie.net/en/OAuth/Authorize?client_id=${dev ? env.BUNGIE_CLIENT_ID_DEV : env.BUNGIE_CLIENT_ID}&response_type=code`,
    '_blank',
    'width=800,height=600'
  )
}
</script>

<header class="bg-DM-15 px-2 py-1">
  <nav class="flex flex-row justify-between">
    <div class="flex flex-row gap-4">
      <div>Nav bar work in progress</div>
      <a href="/">Home</a>
      <a href="/descriptionEditor/">Description Editor</a>
    </div>

    {#if data.username}
      Logged in as {data.username}
    {:else}
      <button onclick={openLoginPage}>Log in</button>
    {/if}
  </nav>
</header>

<main>
  {@render children()}
</main>
