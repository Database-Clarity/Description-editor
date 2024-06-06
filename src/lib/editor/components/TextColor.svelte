<script lang="ts">
import type { Writable } from 'svelte/store'
import type { Editor } from '@tiptap/core'
import Button from './Button.svelte'
import TextColorSvg from '$lib/assets/TextColorSVG.svelte'
import { textColors, type TextColors } from '../extensions/textColor'
import DropDown from '$lib/components/DropDown.svelte'

let { editor }: { editor: Writable<Editor | undefined> } = $props()

let currentColor = $derived<TextColors>($editor?.getAttributes('textColor').class || 'default')
const setTextColor = (color: TextColors) => {
  $editor?.commands.setTextColor(color)
}
</script>

<DropDown class="flex flex-col rounded bg-LM-15 dark:bg-DM-15">
  {#snippet button(onclick)}
    <Button {onclick}>
      <TextColorSvg color={currentColor} />
      <span class="{currentColor} capitalize">{currentColor}</span>
    </Button>
  {/snippet}

  {#each textColors as color}
    <Button onclick={() => setTextColor(color)}>
      <TextColorSvg {color} />
      <span class="{color} capitalize">{color}</span>
    </Button>
  {/each}
</DropDown>
