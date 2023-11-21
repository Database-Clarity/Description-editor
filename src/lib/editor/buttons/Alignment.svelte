<script lang="ts">
  import type { Readable } from 'svelte/store'
  import type { Editor } from 'svelte-tiptap'
  import { alignments, type Alignments } from './alignment'
  import DropDown from '$lib/components/DropDown.svelte'

  export let editor: Readable<Editor> | undefined

  $: selectedTextAlignment = $editor?.getAttributes('div').class?.replace('text-', '') || 'left'

  const setTextAlign = (align: Alignments) => {
    selectedTextAlignment = align
    $editor?.commands.setTextAlign(align)
  }
</script>

<DropDown>
  <svelte:fragment slot="button">
    <span>{selectedTextAlignment}</span>
  </svelte:fragment>

  <svelte:fragment slot="content">
    {#each alignments as aliment}
      <button on:click={() => setTextAlign(aliment)}>
        <span>{aliment}</span>
      </button>
    {/each}
  </svelte:fragment>
</DropDown>
