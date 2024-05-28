<script lang="ts">
import type { Editor } from '@tiptap/core'
import type { Writable } from 'svelte/store'
import tableSVG from '$lib/assets/table.svg'
import Button from './Button.svelte'
import DropDown from '$lib/components/DropDown.svelte'

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

const addRowColumn = (location: 'RowAfter' | 'RowBefore' | 'ColumnAfter' | 'ColumnBefore') => {
  $editor?.chain().focus()[`add${location}`]().run()
}
const removeRowColumn = (location: 'Column' | 'Row') => {
  $editor?.chain().focus()[`delete${location}`]().run()
}
</script>

<DropDown class="flex flex-col rounded">
  {#snippet button(onclick)}
    <Button {onclick}>
      <img src={tableSVG} alt="table" />
      <span>Table</span>
    </Button>
  {/snippet}

  <div class="headerInput">
    <label for="include header">Header row?</label>
    <input type="checkbox" name="include header" bind:checked={withHeaderRow} />
  </div>
  <div class="tableSelection">
    {#each Array(7) as _, rowIndex}
      {#each Array(7) as _, columnIndex}
        <button
          onclick={addTable}
          onmouseenter={() => setData(columnIndex, rowIndex)}
          onmouseleave={resetData}
          class={`${columnIndex < cols - 1 && rowIndex < rows - 1 ? 'highlight' : ''}`}
        >
          {columnIndex === 0 ? rowIndex + 2 : ''}
          {rowIndex === 0 && columnIndex !== 0 ? columnIndex + 2 : ''}
        </button>
      {/each}
    {/each}
  </div>
  <button>Merge</button>
  <button>Split</button>
  <div>Add/Remove Row/Column</div>
  <div class="insert-remove">
    <button class="delete-column" onclick={() => removeRowColumn('Column')}>Remove</button>
    <button class="delete-row" onclick={() => removeRowColumn('Row')}>Remove</button>
    <button class="row-above" onclick={() => addRowColumn('RowBefore')}>Add</button>
    <button class="row-bellow" onclick={() => addRowColumn('RowAfter')}>Add</button>
    <button class="column-left" onclick={() => addRowColumn('ColumnBefore')}>Add</button>
    <button class="column-right" onclick={() => addRowColumn('ColumnAfter')}>Add</button>
  </div>
</DropDown>

<style lang="scss">
.insert-remove {
  display: grid;
  grid-template-columns: auto 1fr 1fr 1fr;
  grid-template-rows: 1fr 1fr 1fr 1fr;
  // gap: 0.3rem;
  grid-auto-flow: row;
  grid-template-areas:
    'delete-column top-left row-above top-right'
    'delete-column column-left . column-right'
    'delete-column bottom-left row-bellow bottom-right'
    'delete-column delete-row delete-row delete-row';
  justify-items: center;
  border: 1px solid hsl(0, 0%, 80%);
}
.delete-column {
  grid-area: delete-column;
  writing-mode: vertical-rl;
  text-orientation: upright;
  &:hover {
    background-color: hsla(0, 100%, 50%, 0.25);
  }
}
.delete-row {
  grid-area: delete-row;
  width: 100%;
  justify-content: center;
  &:hover {
    background-color: hsla(0, 100%, 50%, 0.25);
  }
}
.row-above {
  grid-area: row-above;
  justify-content: center;
  &:hover {
    width: 300%;
    background-color: rgba(120, 100%, 25%, 0.25);
    grid-area: top-left / row-above / top-right;
  }
}
.row-bellow {
  grid-area: row-bellow;
  justify-content: center;
  &:hover {
    width: 300%;
    background-color: rgba(120, 100%, 25%, 0.25);
    grid-area: bottom-left / row-bellow / bottom-right;
  }
}
.column-left {
  grid-area: column-left;
  &:hover {
    background-color: rgba(120, 100%, 25%, 0.25);
    grid-area: top-left / column-left / bottom-left;
  }
}
.column-right {
  grid-area: column-right;
  &:hover {
    background-color: rgba(120, 100%, 25%, 0.25);
    grid-area: top-right / column-right / bottom-right;
  }
}

.dropDownContent {
  position: absolute;
  display: flex;
  flex-direction: column;
  z-index: 99;
  background-color: hsl(0, 0%, 15%);
  padding: 0.5rem;
  border-radius: 0.3rem;
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
  padding: 0.3rem 0;
  width: min-content;
}
.highlight {
  background-color: hsl(120, 100%, 25%) !important;
}
</style>
