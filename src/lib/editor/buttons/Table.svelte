<script lang="ts">
  import DropDown from '$lib/components/DropDown.svelte'
  import type { Editor } from 'svelte-tiptap'
  import type { Readable } from 'svelte/store'

  export let editor: Readable<Editor> | undefined

  let cols = 0
  let rows = 0
  let withHeaderRow = false

  const setData = (columnIndex: number, rowIndex: number) => {
    cols = columnIndex + 1
    rows = rowIndex + 1
  }
  const resetData = () => {
    cols = 0
    rows = 0
  }

  const addTable = () => {
    $editor?.chain().focus().insertTable({ cols, rows, withHeaderRow }).run()
    resetData()
  }
</script>

<DropDown>
  <svelte:fragment slot="button">
    <span>Table</span>
  </svelte:fragment>

  <svelte:fragment slot="content">
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
            {columnIndex === 0 ? rowIndex + 1 : ''}
            {rowIndex === 0 && columnIndex !== 0 ? columnIndex + 1 : ''}
          </button>
        {/each}
      {/each}
    </div>
  </svelte:fragment>
</DropDown>

<style>
  button {
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
