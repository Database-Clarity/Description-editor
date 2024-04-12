<script lang="ts">
  import type { Readable } from 'svelte/store'
  import type { Editor } from 'svelte-tiptap'
  import { alignments, type Alignments } from './alignment'

  import center from '$lib/assets/alignCenter.svg'
  import left from '$lib/assets/alignLeft.svg'
  import right from '$lib/assets/alignRight.svg'

  export let editor: Readable<Editor> | undefined

  type AlignIconsNames = 'center' | 'left' | 'right'

  const alignIcons = {
    center,
    left,
    right,
  }

  $: currentAlignment = ($editor?.getAttributes('div').class?.replace('text-', '') as AlignIconsNames) || 'left'
  const setTextAlign = (align: Alignments) => {
    currentAlignment = align
    $editor?.commands.setTextAlign(align)
  }

  let dropdownOpen = false
  const handleFocusLoss = ({ relatedTarget, currentTarget }: FocusEvent) => {
    if (relatedTarget && (currentTarget as Node)?.contains(relatedTarget as Node)) return
    dropdownOpen = false
  }
</script>

<div on:focusout={handleFocusLoss}>
  <button on:click={() => (dropdownOpen = !dropdownOpen)}>
    <img src={alignIcons[currentAlignment]} alt={currentAlignment} />
    <span class={`text-${currentAlignment}`}>{currentAlignment}</span>
  </button>

  {#if dropdownOpen}
    <div class="dropDownContent">
      {#each alignments as alignment}
        <button on:click={() => setTextAlign(alignment)}>
          <img src={alignIcons[alignment]} alt={alignment} />
          <span class={`text-${alignment}`}>{alignment}</span>
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
    width: 15px;
  }
  span {
    text-transform: capitalize;
  }
</style>
