<script lang="ts">
import type { Snippet } from 'svelte'

let {
  button,
  children,
  class: dropDownClass,
}: {
  button: Snippet<[() => void]>
  children: Snippet
  class?: string
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
    <div class={'absolute z-50' + (dropDownClass === undefined ? '' : ' ' + dropDownClass)}>
      {@render children()}
    </div>
  {/if}
</div>
