<script lang="ts">
import type { Snippet } from 'svelte'
import type { HTMLButtonAttributes } from 'svelte/elements'

type Props = {
  children: Snippet
  active?: boolean
  class?: string
} & HTMLButtonAttributes

let { children, active, class: className, ...props }: Props = $props()
</script>

<button class="editor-button" {...props}>
  {@render children()}
</button>

<style>
.editor-button:has(span) {
  /* Layout properties */
  display: grid;
  grid-template-columns: 1fr 3fr;
  justify-items: center;
  align-items: center;

  /* Size properties */
  width: 6.5rem;
}

.editor-button:not(:has(span)) {
  /* Layout properties */
  display: flex;
  justify-content: center;
  align-items: center;

  /* Size properties */
  width: 1.5rem;
}

.editor-button {
  /* Size properties */
  height: 1.5rem;

  /* Visual properties */
  border-radius: 0.25rem;
  background-color: hsl(0, 0%, 15%);

  @media (prefers-color-scheme: light) {
    background-color: hsl(0, 0%, 85%);
  }

  /* Hover state */
  &:hover {
    background-color: hsl(0, 0%, 25%);

    @media (prefers-color-scheme: light) {
      background-color: hsl(0, 0%, 75%);
    }
  }

  /* Active state */
  &:active {
    background-color: hsl(120, 80%, 50%);

    @media (prefers-color-scheme: light) {
      background-color: hsl(120, 100%, 25%);
    }
  }
}

:global(.editor-button > span) {
  /* Flexbox/Grid properties */
  justify-self: baseline;

  /* Text-related properties */
  text-wrap: nowrap;
  text-transform: capitalize;
  text-overflow: ellipsis;
  text-align: start;
  white-space: nowrap;

  /* Overflow properties */
  overflow: hidden;
}
</style>
