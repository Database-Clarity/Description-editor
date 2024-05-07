<script lang="ts">
import type { Snippet } from 'svelte'
import type { HTMLButtonAttributes } from 'svelte/elements'

interface Props extends HTMLButtonAttributes {
  children: Snippet
  active?: boolean
}

let { children, active = false, ...props }: Props = $props()
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
  display: flex;
  flex-direction: row;
  flex-wrap: nowrap;
  align-items: center;
  cursor: pointer;
  gap: 0.5rem;
  height: 1.5rem;

  background-color: hsl(0, 0%, 15%);
  border: none;
  border-radius: 0.3rem;
  &:hover {
    background-color: hsl(0, 0%, 25%);
  }
  :global(img) {
    height: 1rem;
    width: 1rem;
  }
  :global(span) {
    text-transform: capitalize;
  }
}
</style>
