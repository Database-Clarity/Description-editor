<script lang="ts">
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

let dropdownOpen = $state<boolean>(false)
const handleFocusLoss = ({ relatedTarget, currentTarget }: FocusEvent) => {
  if (relatedTarget && (currentTarget as Node)?.contains(relatedTarget as Node)) return
  dropdownOpen = false
}
</script>

<div onfocusout={handleFocusLoss}>
  <Button onclick={() => (dropdownOpen = !dropdownOpen)}>
    <Alignment align={currentAlignment} />
    <span class={currentAlignment}>{currentAlignment}</span>
  </Button>

  {#if dropdownOpen}
    <div class="dropDownContent">
      {#each alignments as alignment}
        <Button onclick={() => setTextAlign(alignment)}>
          <Alignment align={alignment} />
          <span class={alignment}>{alignment}</span>
        </Button>
      {/each}
    </div>
  {/if}
</div>
