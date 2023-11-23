<script lang="ts">
  import type { Readable } from 'svelte/store'
  import type { Editor } from 'svelte-tiptap'
  import boldSVG from '$lib/assets/bold.svg'

  export let editor: Readable<Editor> | undefined

  $: active = $editor?.isActive('bold')
  const toggleBold = () => {
    $editor?.commands.toggleBold()
  }
</script>

<button on:click={toggleBold} class:active title="CTRL + B / ⌘ + B">
  <img src={boldSVG} alt="bold" />
  <span class="text">Bold</span>
</button>

<style lang="scss">
  .active {
    background-color: hsl(0, 0%, 20%);
  }

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
      height: 20px;
    }
  }
</style>
