<script lang="ts">
  import type { Readable } from 'svelte/store'
  import type { Editor } from 'svelte-tiptap'
  import BoldSVG from '$lib/assets/Bold.svelte'

  export let editor: Readable<Editor> | undefined

  $: active = $editor?.isActive('bold')
  const toggleBold = () => {
    $editor?.commands.toggleBold()
  }
</script>

<button on:click={toggleBold} class:active title="CTRL + B / ⌘ + B">
  <BoldSVG />
  <span class="text">Bold</span>
</button>

<style lang="scss">
  @import '/src/variables.scss';

  .active {
    background-color: $button-background-color-active;
    fill: $button-SVG-color-active;
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

    background-color: $button-background-color;
    border: none;
    border-radius: 5px;
    color: inherit;
    &:hover {
      background-color: $button-background-color-active;
      fill: $button-SVG-color-active;
    }
    fill: $button-SVG-color;
    img {
      height: 20px;
    }
  }
</style>
