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
flex flex-row flex-nowrap gap-1 items-center
bg-LM-15 dark:bg-DM-15
hover:bg-LM-25 hover:dark:bg-DM-25
`

</script>

<button class:active {...props} class="{style} {className ?? ''}">
  {@render children()}
</button>

<style lang="postcss">
.active {
  @apply bg-LM-25 dark:bg-DM-25 text-LM-accent dark:text-DM-accent;
}
</style>

