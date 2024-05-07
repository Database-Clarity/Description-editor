<script lang="ts">
import type { Writable } from 'svelte/store'
import type { Editor } from '@tiptap/core'
import Button from './Button.svelte'
import TextColorSvg from '$lib/assets/TextColorSVG.svelte'
import { textColors, type TextColors } from '../extensions/textColor'

let { editor }: { editor: Writable<Editor | undefined> } = $props()

let currentColor = $derived<TextColors>($editor?.getAttributes('textColor').class || 'default')
const setTextColor = (color: TextColors) => {
  $editor?.commands.setTextColor(color)
}

let dropdownOpen = $state<boolean>(false)
const handleFocusLoss = ({ relatedTarget, currentTarget }: FocusEvent) => {
  if (relatedTarget && (currentTarget as Node)?.contains(relatedTarget as Node)) return
  dropdownOpen = false
}
</script>

<div onfocusout={handleFocusLoss} class="editorStyles">
  <Button onclick={() => (dropdownOpen = !dropdownOpen)}>
    <TextColorSvg color={currentColor} />
    <span class={currentColor}>{currentColor}</span>
  </Button>

  {#if dropdownOpen}
    <div class="dropDownContent">
      {#each textColors as color}
        <Button onclick={() => setTextColor(color)}>
          <TextColorSvg {color} />
          <span class={color}>{color}</span>
        </Button>
      {/each}
    </div>
  {/if}
</div>

<style lang="scss">
.dropDownContent {
  position: absolute;
  display: flex;
  flex-direction: column;
  z-index: 99;

  background-color: hsl(0, 0%, 15%);
  border-radius: 5px;
}
</style>
