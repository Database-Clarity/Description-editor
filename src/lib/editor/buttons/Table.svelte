<script lang="ts">
  import type { Editor } from 'svelte-tiptap'
  import type { Readable } from 'svelte/store'
  import tableSVG from '$lib/assets/table.svg'

  export let editor: Readable<Editor> | undefined

  let cols = 0
  let rows = 0
  let withHeaderRow = false

  const setData = (columnIndex: number, rowIndex: number) => {
    cols = columnIndex + 2
    rows = rowIndex + 2
  }
  const resetData = () => {
    cols = 0
    rows = 0
  }

  const addTable = () => {
    $editor?.chain().focus().insertTable({ cols, rows, withHeaderRow }).run()
    resetData()
  }

  let dropdownOpen = false
  const handleFocusLoss = ({ relatedTarget, currentTarget }: FocusEvent) => {
    if (relatedTarget && (currentTarget as Node)?.contains(relatedTarget as Node)) return
    dropdownOpen = false
  }
</script>

<div on:focusout={handleFocusLoss} class="dropDown">
  <button on:click={() => (dropdownOpen = !dropdownOpen)} class="btn">
    <img src={tableSVG} alt="table" />
    <span>Table</span>
  </button>

  {#if dropdownOpen}
    <div class="dropDownContent">
      <label for="include header">Header row?</label>
      <input type="checkbox" name="include header" bind:checked={withHeaderRow} />
      <div class="tableSelection">
        {#each Array(7) as _, columnIndex}
          {#each Array(7) as _, rowIndex}
            <button
              on:click={addTable}
              on:mouseenter={() => setData(columnIndex, rowIndex)}
              on:mouseleave={resetData}
              class={`${columnIndex < cols - 1 && rowIndex < rows - 1 ? 'highlight' : ''}`}
            >
              {columnIndex === 0 ? rowIndex + 2 : ''}
              {rowIndex === 0 && columnIndex !== 0 ? columnIndex + 2 : ''}
            </button>
          {/each}
        {/each}
      </div>
    </div>
  {/if}
</div>

<style lang="scss">
  .dropDownContent {
    position: absolute;
    display: flex;
    flex-direction: column;
    z-index: 99;
  }

  .btn {
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
      height: 18px;
    }
  }

  .tableSelection button {
    width: 25px;
    height: 25px;
    border: 1px solid hsl(0, 0%, 80%);
    background-color: hsl(0, 0%, 15%);
    cursor: pointer;
    color: inherit;
  }
  .tableSelection {
    display: grid;
    grid-template-columns: repeat(7, 1fr);
    grid-template-rows: repeat(7, 1fr);
    border-radius: 5px;
  }
  .highlight {
    background-color: green !important;
  }
</style>
