<script lang="ts">
import type { Snippet } from 'svelte'
import type { HTMLButtonAttributes } from 'svelte/elements'

interface Props extends HTMLButtonAttributes {
  children: Snippet
  active?: boolean
  class?: string
}

let { children, active, class: className, ...props }: Props = $props()
</script>

<button class:active {...props} class="h-6 w-28 rounded {className ?? ''}">
  {@render children()}
</button>

<style lang="postcss">
.active {
  @apply bg-neutral-800 text-lime-400;
}
:global(img) {
  @apply h-4 w-4;
}
:global(span) {
  @apply capitalize;
}
</style>
