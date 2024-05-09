<script lang="ts">
  import type { Snippet } from 'svelte'

  const {
    children,
    as = 'div',
    ...restProps
  }: {
    children?: Snippet
    as?: string
  } = $props()
</script>

<svelte:element this={as} style="white-space: normal;" data-node-view-wrapper="" role="none" {...restProps}>
  {#if children}
    {@render children()}
  {/if}
</svelte:element>
