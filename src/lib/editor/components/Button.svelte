<script lang="ts">
import type { Snippet } from 'svelte'
import type { HTMLButtonAttributes } from 'svelte/elements'

type Props = {
  children: Snippet
  active?: boolean
  class?: string
} & HTMLButtonAttributes

let { children, active, class: className, ...props }: Props = $props()

const style = `
h-6 w-28
rounded
grid grid-cols-[1fr_3fr] justify-items-center items-center
bg-LM-15 dark:bg-DM-15
hover:bg-LM-25 hover:dark:bg-DM-25
`
</script>

<button class:text-DM-accent={active} {...props} class="{style} {className ?? ''}">
  {@render children()}
</button>

<style>
:global(button > span) {
  justify-self: baseline;
  text-wrap: nowrap;
  text-transform: capitalize;
}
</style>
