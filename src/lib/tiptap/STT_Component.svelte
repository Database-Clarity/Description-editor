<script lang="ts">
import { getContext, type Snippet } from 'svelte'

const { ondragstart } = getContext<{
  ondragstart: (event: DragEvent) => void
}>('STT_DragEvent')

const {
  children,
  as = 'div',
  ...restProps
}: {
  children?: Snippet
  as?: string
} = $props()
</script>

<svelte:element
  this={as}
  style="white-space: normal;"
  data-node-view-wrapper=""
  role="none"
  {ondragstart}
  {...restProps}>
  {#if children}
    {@render children()}
  {/if}
</svelte:element>
