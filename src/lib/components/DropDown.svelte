<script lang="ts">
import type { Snippet } from 'svelte'

let {
  button,
  children,
}: {
  button: Snippet<[() => void]>
  children: Snippet
} = $props()

let dropdownOpen = $state<boolean>(false)
const onfocusout = ({ relatedTarget, currentTarget }: FocusEvent) => {
  if (relatedTarget && (currentTarget as Node)?.contains(relatedTarget as Node)) return
  dropdownOpen = false
}

const buttonPress = () => {
  dropdownOpen = !dropdownOpen
}
</script>

<div {onfocusout}>
  {@render button(buttonPress)}

  {#if dropdownOpen}
    <div class="dropdown">
      {@render children()}
    </div>
  {/if}
</div>

<style>
.dropdown {
  position: absolute;
  z-index: 10;
}
</style>
