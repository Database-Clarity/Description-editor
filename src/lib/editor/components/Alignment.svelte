<script lang="ts">
import type { Writable } from 'svelte/store'
import type { Editor } from '@tiptap/core'
import { alignments, type Alignments } from '../extensions/alignment'
import Alignment from '$lib/assets/Alignment.svelte'
import Button from './Button.svelte'
import DropDown from '$lib/components/DropDown.svelte'

let { editor }: { editor: Writable<Editor | undefined> } = $props()

let currentAlignment = $derived<Alignments>($editor?.getAttributes('div').class || 'left')
const setTextAlign = (align: Alignments) => {
  $editor?.commands.setTextAlign(align)
}
</script>

<DropDown class="flex flex-col rounded">
  {#snippet button(onclick)}
    <Button {onclick}>
      <Alignment align={currentAlignment} />
      <span class={currentAlignment}>{currentAlignment}</span>
    </Button>
  {/snippet}

  {#each alignments as alignment}
    <Button onclick={() => setTextAlign(alignment)}>
      <Alignment align={alignment} />
      <span class={alignment}>{alignment}</span>
    </Button>
  {/each}
</DropDown>
