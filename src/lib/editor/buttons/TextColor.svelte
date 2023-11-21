<script lang="ts">
  import type { Readable } from 'svelte/store'
  import type { Editor } from 'svelte-tiptap'
  import { textColors, type TextColors } from './textColor'
  import TextColorSVG from '$lib/assets/TextColorSVG.svelte'
  import DropDown from '$lib/components/DropDown.svelte'

  export let editor: Readable<Editor> | undefined

  $: selectedTextColor = $editor?.getAttributes('textColor').class?.replace('text-', '') || 'default'
  const changeTextColor = (color: TextColors) => {
    selectedTextColor = color
    if (color === 'default') {
      $editor?.chain().focus().removeTextColor().run()
    } else {
      $editor?.chain().focus().setTextColor(color).run()
    }
  }
</script>

<DropDown>
  <svelte:fragment slot="button">
    <TextColorSVG underlineColor={selectedTextColor} />
    <span class={`text-${selectedTextColor}`}>{selectedTextColor}</span>
  </svelte:fragment>

  <svelte:fragment slot="content">
    {#each textColors as color}
      <button on:click={() => changeTextColor(color)}>
        <TextColorSVG underlineColor={color} />
        <span class={`text-${color}`}>{color}</span>
      </button>
    {/each}
  </svelte:fragment>
</DropDown>
