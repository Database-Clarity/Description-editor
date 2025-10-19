<script lang="ts">
import type { Writable } from 'svelte/store'
import type { Editor } from '@tiptap/core'
import Button from './Button.svelte'
import TextColorSvg from '$lib/assets/textFormatting/TextColorSVG.svelte'
import { textColors, type TextColors } from '../extensions/textColor'
import DropDown from '$lib/components/DropDown.svelte'

let {
  editor,
  displayText = true,
}: {
  editor: Writable<Editor | undefined>
  displayText?: boolean
} = $props()

let currentColor = $derived<TextColors>($editor?.getAttributes('textColor').class || 'default')
const setTextColor = (color: TextColors) => {
  $editor?.commands.setTextColor(color)
}
</script>

<DropDown class="flex flex-col rounded bg-LM-15 dark:bg-DM-15">
  {#snippet button(onclick)}
    <Button {onclick}>
      <TextColorSvg color={currentColor} />
      {#if displayText}
        <span class={currentColor}>{currentColor}</span>
      {/if}
    </Button>
  {/snippet}

  {#each textColors as color}
    <Button onclick={() => setTextColor(color)}>
      <TextColorSvg {color} />
      <span class={color}>{color}</span>
    </Button>
  {/each}
</DropDown>
