<svelte:options runes={true} />

<script lang="ts">
  import type { LayoutData } from './$types'
  import Selection from '$lib/sideBar/Selection.svelte'
  const { lang, perks }: LayoutData = $props()
</script>

<div>
  <slot />
</div>

<div class="sidebar">
  <Selection perksPromise={perks} {lang} />
</div>
