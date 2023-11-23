<script lang="ts">
  import type { Editor } from 'svelte-tiptap'
  import type { Readable } from 'svelte/store'

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
  <button on:click={() => (dropdownOpen = !dropdownOpen)}>
    <span>Table</span>
  </button>

  {#if dropdownOpen}
    <div class="dropDownContent">
      <label for="include header">Include Header row?</label>
      <input type="checkbox" name="include header" bind:checked={withHeaderRow} />
      <div class="tableSelection">
        {#each Array(7) as _, columnIndex}
          {#each Array(7) as _, rowIndex}
            <button
              on:click={addTable}
              on:mouseenter={() => setData(columnIndex, rowIndex)}
              on:mouseleave={resetData}
              class={`${columnIndex < cols && rowIndex < rows ? 'highlight' : ''}`}
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

<!-- <style lang="scss">
  .dropDownContent {
    position: absolute;
    display: flex;
    flex-direction: column;
    z-index: 99;
  }
  button {
    display: flex;
    flex-direction: row;
    flex-wrap: nowrap;
    align-items: center;
    cursor: pointer;
    gap: 6px;
    width: 80px;
  }
  img {
    height: 15px;
  }
  span {
    text-transform: capitalize;
  }
</style> -->

<style>
  .dropDownContent {
    position: absolute;
    display: flex;
    flex-direction: column;
    z-index: 99;
  }

  button {
    display: flex;
    flex-direction: row;
    flex-wrap: nowrap;
    align-items: center;
    cursor: pointer;
    gap: 6px;
    width: 80px;
  }

  .tableSelection button {
    width: 30px;
    height: 30px;
    border: 1px solid #ccc;
    background-color: #fff;
  }
  .tableSelection {
    display: grid;
    grid-template-columns: repeat(7, 1fr);
    grid-template-rows: repeat(7, 1fr);
  }
  .highlight {
    background-color: green;
  }
</style>
