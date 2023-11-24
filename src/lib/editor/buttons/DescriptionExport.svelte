<script lang="ts">
  import type { Readable } from 'svelte/store'
  import type { Editor } from 'svelte-tiptap'
  import exportSVG from '$lib/assets/export.svg'

  export let editor: Readable<Editor> | undefined

  // $: commentActive = $editor?.isActive('comment')
  // const toggleComment = () => {
  //   $editor?.commands.toggleComment()
  // }
</script>

<button on:click={() => $editor?.commands.toggleExport()}>
  <img src={exportSVG} alt="export" />
  <span class="text">Export</span>
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
