<script lang="ts">
import type { Editor } from '@tiptap/core'
import type { Writable } from 'svelte/store'
import tableSVG from '$lib/assets/table.svg'
import Button from './Button.svelte'

let { editor }: { editor: Writable<Editor | undefined> } = $props()

let cols = $state(0)
let rows = $state(0)
let withHeaderRow = $state(false)

const setData = (columnIndex: number, rowIndex: number) => {
  cols = columnIndex + 2
  rows = rowIndex + 2
}
const resetData = () => {
  cols = 0
  rows = 0
}

const addTable = () => {
  if ($editor?.isActive('table')) {
    // Prevent adding a table inside another table
    $editor?.commands.focus()
    return
  }
  $editor?.chain().focus().insertTable({ cols, rows, withHeaderRow }).run()
  resetData()
}

let dropdownOpen = $state<boolean>(false)
const handleFocusLoss = ({ relatedTarget, currentTarget }: FocusEvent) => {
  if (relatedTarget && (currentTarget as Node)?.contains(relatedTarget as Node)) return
  dropdownOpen = false
}
</script>

<div onfocusout={handleFocusLoss} class="dropDown">
  <Button onclick={() => (dropdownOpen = !dropdownOpen)}>
    <img src={tableSVG} alt="table" />
    <span>Table</span>
  </Button>

  {#if dropdownOpen}
    <div class="dropDownContent">
      <div class="headerInput">
        <label for="include header">Header row?</label>
        <input type="checkbox" name="include header" bind:checked={withHeaderRow} />
      </div>
      <div class="tableSelection">
        {#each Array(7) as _, columnIndex}
          {#each Array(7) as _, rowIndex}
            <button
              onclick={addTable}
              onmouseenter={() => setData(columnIndex, rowIndex)}
              onmouseleave={resetData}
              class={`${columnIndex < cols - 1 && rowIndex < rows - 1 ? 'highlight' : ''}`}>
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

.headerInput {
  display: flex;
  gap: 0.5rem;
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
