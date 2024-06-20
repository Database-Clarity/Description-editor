<script lang="ts">
import type { Snippet } from 'svelte'
import type { HTMLButtonAttributes } from 'svelte/elements'

interface Props extends HTMLButtonAttributes {
  children: Snippet
  active?: boolean
  class?: string
}

let { children, active, class: className, ...props }: Props = $props()

const style = `
h-6 w-28
rounded
grid grid-cols-[1fr_3fr] justify-items-center items-center
bg-LM-15 dark:bg-DM-15
hover:bg-LM-25 hover:dark:bg-DM-25
`

// flex flex-row flex-nowrap gap-1 items-center
</script>

<button class:active {...props} class="{style}  {className ?? ''}">
  {@render children()}
</button>

<style>
:global(button > span) {
  justify-self: baseline;
}
</style>
