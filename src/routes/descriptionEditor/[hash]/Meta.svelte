<script lang="ts">
const { hash }: { hash: number } = $props()
</script>

<svelte:head>
  <!-- {#await data.perksPromise then value} -->
  <!-- HTML Meta Tags -->
  <title>Clarity Description Editor</title>
  <meta name="description" content={`Description for figure out how to add perk name`} />

  <!-- Facebook Meta Tags -->
  <meta property="og:url" content={`https://description-editor.vercel.app/descriptionEditor/${hash}`} />
  <meta property="og:type" content="website" />
  <meta property="og:title" content="Clarity Description Editor" />
  <meta property="og:description" content={`Description for figure out how to add perk name`} />
  <meta property="og:image" content="" />

  <!-- Twitter Meta Tags -->
  <meta name="twitter:card" content="summary_large_image" />
  <meta property="twitter:domain" content="description-editor.vercel.app" />
  <meta property="twitter:url" content={`https://description-editor.vercel.app/descriptionEditor/${hash}`} />
  <meta name="twitter:title" content="Clarity Description Editor" />
  <meta name="twitter:description" content={`Description for figure out how to add perk name`} />
  <meta name="twitter:image" content="" />
  <!-- {/await} -->
</svelte:head>
