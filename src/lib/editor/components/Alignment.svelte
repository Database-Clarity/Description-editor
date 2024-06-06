<script lang="ts">
import DropDown from '$lib/components/DropDown.svelte'
import type { Writable } from 'svelte/store'
import type { Editor } from '@tiptap/core'
import { alignments, type Alignments } from '../extensions/alignment'
import Alignment from '$lib/assets/Alignment.svelte'
import Button from './Button.svelte'

let { editor }: { editor: Writable<Editor | undefined> } = $props()

let currentAlignment = $derived<Alignments>($editor?.getAttributes('div').class || 'left')
const setTextAlign = (align: Alignments) => {
  $editor?.commands.setTextAlign(align)
}
</script>

<DropDown class="flex flex-col rounded bg-LM-15 dark:bg-DM-15">
  {#snippet button(onclick)}
    <Button {onclick}>
      <Alignment align={currentAlignment} />
      <span class="{currentAlignment} capitalize">{currentAlignment}</span>
    </Button>
  {/snippet}

  {#each alignments as alignment}
    <Button onclick={() => setTextAlign(alignment)}>
      <Alignment align={alignment} />
      <span class="{alignment} capitalize">{alignment}</span>
    </Button>
  {/each}
</DropDown>
