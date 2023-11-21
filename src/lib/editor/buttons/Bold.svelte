<script lang="ts">
  import type { Readable } from 'svelte/store'
  import type { Editor } from 'svelte-tiptap'
  import textBoldSVG from '$lib/assets/text-bold.svg'

  export let editor: Readable<Editor> | undefined

  $: boldActive = $editor?.isActive('bold')
  const toggleBold = () => {
    $editor?.commands.toggleBold()
  }
</script>

<button on:click={toggleBold} class:boldActive title="CTRL + B / ⌘ + B">
  <img src={textBoldSVG} alt="bold" />
</button>

<style>
  .boldActive {
    background-color: red;
  }
</style>
