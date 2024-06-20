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

<DropDown class="flex w-28 flex-col rounded bg-LM-15 dark:bg-DM-15">
  {#snippet button(onclick)}
    <Button {onclick}>
      <TableSVG />
      <span>Table</span>
    </Button>
  {/snippet}

  <div class="self-center">Header</div>
  <Button onclick={() => (horizontalHeader = !horizontalHeader)} active={horizontalHeader} class="pl-1"
    >Horizontal</Button>
  <Button onclick={() => (VerticalHeader = !VerticalHeader)} active={VerticalHeader} class="pl-1">Vertical</Button>

  <div class="tableSelection grid grid-cols-5 grid-rows-5 px-1">
    {#each Array(5) as _, rowIndex}
      {#each Array(5) as _, columnIndex}
        <button
          onclick={addTable}
          onmouseenter={() => setData(columnIndex, rowIndex)}
          onmouseleave={resetData}
          class={`${columnIndex < cols - 1 && rowIndex < rows - 1 ? 'highlight' : ''} flex h-5 w-full items-center justify-center border`}>
          {columnIndex === 0 ? rowIndex + 2 : ''}
          {rowIndex === 0 && columnIndex !== 0 ? columnIndex + 2 : ''}
        </button>
      {/each}
    {/each}
  </div>

  <Button class="pl-1">Merge</Button>
  <Button class="pl-1">Split</Button>

  <Button onclick={() => addRowColumn('ColumnBefore')} class="grid-cols-[1fr_6fr] pl-1">
    <span class="w-2">+</span>
    <span>Col left</span>
  </Button>
  <Button onclick={() => addRowColumn('ColumnAfter')} class="grid-cols-[1fr_6fr] pl-1">
    <span class="w-2">+</span>
    <span>Col right</span>
  </Button>
  <Button onclick={() => addRowColumn('RowBefore')} class="grid-cols-[1fr_6fr] pl-1">
    <span class="w-2">+</span>
    <span>Row above</span>
  </Button>
  <Button onclick={() => addRowColumn('RowAfter')} class="grid-cols-[1fr_6fr] pl-1">
    <span class="w-2">+</span>
    <span>Row bellow</span>
  </Button>

  <Button onclick={() => removeRowColumn('Column')} class="grid-cols-[1fr_6fr] pl-1">
    <span class="w-2">-</span>
    <span>Col</span>
  </Button>
  <Button onclick={() => removeRowColumn('Row')} class="grid-cols-[1fr_6fr] pl-1">
    <span class="w-2">-</span><span>Row</span></Button>
</DropDown>

<style>
.highlight {
  background-color: hsl(120, 100%, 25%) !important;
}
</style>
