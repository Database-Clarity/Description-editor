<script lang="ts">
  import type { Readable } from 'svelte/store'
  import type { Editor } from 'svelte-tiptap'
  import { textColors, type TextColors } from './textColor'
  import TextColorSvg from '$lib/assets/TextColorSVG.svelte'

  export let editor: Readable<Editor> | undefined

  $: selectedTextColor = 'default' as TextColors
  const setTextColor = (color: TextColors) => {
    selectedTextColor = color
    if (color === 'default') {
      $editor?.chain().focus().removeTextColor().run()
    } else {
      $editor?.chain().focus().setTextColor(color).run()
    }
  }

  let dropdownOpen = false
  const handleFocusLoss = ({ relatedTarget, currentTarget }: FocusEvent) => {
    if (relatedTarget && (currentTarget as Node)?.contains(relatedTarget as Node)) return
    dropdownOpen = false
  }
</script>

<div on:focusout={handleFocusLoss} class="dropDown">
  <button on:click={() => (dropdownOpen = !dropdownOpen)}>
    <TextColorSvg underlineColor={selectedTextColor} />
    <span class={`text-${selectedTextColor}`}>{selectedTextColor}</span>
  </button>

  {#if dropdownOpen}
    <div class="dropDownContent">
      {#each textColors as color}
        <button on:click={() => setTextColor(color)}>
          <TextColorSvg underlineColor={color} />
          <span class={`text-${color}`}>{color}</span>
        </button>
      {/each}
    </div>
  {/if}
</div>

<style lang="scss">
  .dropDownContent {
    position: absolute;
    display: flex;
    flex-direction: column;
    z-index: 99;

    background-color: hsl(0, 0%, 15%);
    border-radius: 5px;
  }
  button {
    display: flex;
    flex-direction: row;
    flex-wrap: nowrap;
    align-items: center;
    cursor: pointer;
    gap: 6px;
    width: 80px;
    height: 23px;

    background-color: hsl(0, 0%, 15%);
    border: none;
    border-radius: 5px;
    color: inherit;
    &:hover {
      background-color: hsl(0, 0%, 20%);
    }
  }
  img {
    height: 15px;
  }
  span {
    text-transform: capitalize;
  }
</style>
