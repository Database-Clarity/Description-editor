<script lang="ts">
  import type { Readable } from 'svelte/store'
  import type { Editor } from 'svelte-tiptap'
  import importSVG from '$lib/assets/import.svg'

  export let editor: Readable<Editor> | undefined

  $: commentActive = $editor?.isActive('comment')
  const toggleImport = () => {
    $editor?.commands.toggleImport()
  }
</script>

<button on:click={() => $editor?.commands.toggleImport()}>
  <img src={importSVG} alt="import" />
  <span class="text">Import</span>
</button>

<style lang="scss">
  button {
    font-family: inherit;
    display: flex;
    flex-direction: row;
    flex-wrap: nowrap;
    align-items: center;
    cursor: pointer;
    gap: 6px;
    height: 23px;

    background-color: hsl(0, 0%, 15%);
    border: none;
    border-radius: 5px;
    color: inherit;
    &:hover {
      background-color: hsl(0, 0%, 20%);
    }
    img {
      height: 17px;
    }
  }
</style>
