<script lang="ts">
  import type { Readable } from 'svelte/store'
  import type { Editor } from 'svelte-tiptap'

  export let editor: Readable<Editor> | undefined

  $: commentActive = $editor?.isActive('comment')
  const toggleComment = () => {
    $editor?.commands.toggleComment()
  }
</script>

<button on:click={toggleComment} class:commentActive title="CTRL + B / ⌘ + B"> comment </button>

<style>
  .commentActive {
    background-color: red;
  }
</style>
