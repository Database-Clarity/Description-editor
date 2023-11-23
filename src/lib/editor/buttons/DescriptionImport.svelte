<script lang="ts">
  import type { Readable } from 'svelte/store'
  import type { Editor } from 'svelte-tiptap'

  export let editor: Readable<Editor> | undefined

  $: commentActive = $editor?.isActive('comment')
  const toggleImport = () => {
    $editor?.commands.toggleImport()
  }
</script>

<button on:click={() => $editor?.commands.toggleImport()}>Import</button>
