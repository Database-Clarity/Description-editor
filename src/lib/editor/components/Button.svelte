<script lang="ts">
import type { Snippet } from 'svelte'
import type { HTMLButtonAttributes } from 'svelte/elements'

interface Props extends HTMLButtonAttributes {
  children: Snippet
  active?: boolean
}

let { children, active, ...props }: Props = $props()
</script>

<button class:active {...props}>
  {@render children()}
</button>

<style lang="scss">
.active {
  background-color: hsl(0, 0%, 20%);
  color: hsl(125, 100%, 40%);
  :global(svg) {
    fill: hsl(125, 100%, 40%);
  }
}

button {
  height: 1.5rem;
  width: 6.8rem;

  border-radius: 0.3rem;

  :global(img) {
    height: 1rem;
    width: 1rem;
  }
  :global(span) {
    text-transform: capitalize;
  }
}
</style>
