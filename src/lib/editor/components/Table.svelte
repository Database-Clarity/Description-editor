<script lang="ts">
import type { Editor } from '@tiptap/core'
import type { Writable } from 'svelte/store'
import TableSVG from '$lib/assets/Table.svelte'
import Button from './Button.svelte'
import DropDown from '$lib/components/DropDown.svelte'

let { editor }: { editor: Writable<Editor | undefined> } = $props()

let cols = $state(0)
let rows = $state(0)
let horizontalHeader = $state(false)
let VerticalHeader = $state(false)

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
  $editor?.chain().focus().insertTable({ cols, rows, withHeaderRow: horizontalHeader }).run()
  resetData()
}

const addRowColumn = (location: 'RowAfter' | 'RowBefore' | 'ColumnAfter' | 'ColumnBefore') => {
  $editor?.chain().focus()[`add${location}`]().run()
}
const removeRowColumn = (location: 'Column' | 'Row') => {
  $editor?.chain().focus()[`delete${location}`]().run()
}
</script>

<DropDown class="flex flex-col rounded bg-LM-15 dark:bg-DM-15">
  {#snippet button(onclick)}
    <Button {onclick} class="w-32">
      <TableSVG img="table" />
      Table
    </Button>
  {/snippet}

  <div class="self-center">Include header</div>
  <Button onclick={() => (horizontalHeader = !horizontalHeader)} active={horizontalHeader} class="w-32">
    <TableSVG img="removeRow" />
    Horizontal
  </Button>
  <Button onclick={() => (VerticalHeader = !VerticalHeader)} active={VerticalHeader} class="w-32">
    <TableSVG img="removeRow" />
    Vertical
  </Button>

  <div class="tableSelection grid grid-cols-6 grid-rows-6 p-1">
    {#each Array(6) as _, rowIndex}
      {#each Array(6) as _, columnIndex}
        <button
          onclick={addTable}
          onmouseenter={() => setData(columnIndex, rowIndex)}
          onmouseleave={resetData}
          class={`${columnIndex < cols - 1 && rowIndex < rows - 1 ? 'highlight' : ''} flex h-5 w-5 items-center justify-center border`}>
          {columnIndex === 0 ? rowIndex + 2 : ''}
          {rowIndex === 0 && columnIndex !== 0 ? columnIndex + 2 : ''}
        </button>
      {/each}
    {/each}
  </div>

  <Button class="w-32"><TableSVG img="merge" />Merge</Button>
  <Button class="w-32"><TableSVG img="split" />Split</Button>

  <Button onclick={() => addRowColumn('ColumnBefore')} class="w-32">
    <TableSVG img="addColLeft" />
    + Col left
  </Button>
  <Button onclick={() => addRowColumn('ColumnAfter')} class="w-32">
    <TableSVG img="addColRight" />
    + Col right
  </Button>
  <Button onclick={() => addRowColumn('RowBefore')} class="w-32">
    <TableSVG img="addRowAbove" />
    + Row above
  </Button>
  <Button onclick={() => addRowColumn('RowAfter')} class="w-32">
    <TableSVG img="addRowBelow" />
    + Row bellow
  </Button>

  <Button onclick={() => removeRowColumn('Column')} class="w-32">
    <TableSVG img="removeCol" />
    - Col
  </Button>
  <Button onclick={() => removeRowColumn('Row')} class="w-32">
    <TableSVG img="removeRow" />
    - Row
  </Button>
</DropDown>

<style>
.highlight {
  background-color: hsl(120, 100%, 25%) !important;
}
</style>
