<script lang="ts">
type Props = {
  img:
    | 'table'
    | 'split'
    | 'merge'
    | 'addColLeft'
    | 'addColRight'
    | 'addRowAbove'
    | 'addRowBelow'
    | 'removeCol'
    | 'removeRow'
}

const { img }: Props = $props()

const xmlns = 'http://www.w3.org/2000/svg'
const style = `h-5 fill-LM-text px-1 dark:fill-DM-text`
const viewBox = '0 0 17 24'
</script>

{#if img === 'table'}
  <svg {xmlns} {viewBox} class={style}>
    <path
      d="m0 8q0-4 3-4h11q3 0 3 3v10q0 3-3 3H3q-3 0-3-3zm2 7.5V17q0 1 1 1h4.5v-2.5zm7.5 0V18H14q1 0 1-1v-1.5zM2 11v2.5h5.5V11zm7.5 0v2.5H15V11zM2 9h13V8q0-2-2-2H4Q2 6 2 8z" />
  </svg>
{:else if img === 'split'}
  <svg {xmlns} {viewBox} class={style}>
    <path
      d="m0 8q0-4 3-4h11q3 0 3 3v10q0 3-3 3H3q-3 0-3-3zm2 8v1q0 1 1 1h4.5v-2zm7.5 0v2H14q1 0 1-1v-1zM2 10v4h13v-4zm0-2h5.5V6H3Q2 6 2 7zm7.5 0H15V7q0-1-1-1H9.5zM8 10.3h1v.5H8zm0 1h1v.5H8zm0 1h1v.5H8zm0 1h1v.5H8z" />
  </svg>
{:else if img === 'merge'}
  <svg {xmlns} {viewBox} class={style}>
    <path
      d="m0 8q0-4 3-4h11q3 0 3 3v10q0 3-3 3H3q-3 0-3-3zm2 8v1q0 1 1 1h4.5v-2zm7.5 0v2H14q1 0 1-1v-1zM2 10v4h13v-4zm0-2h5.5V6H3Q2 6 2 7zm7.5 0H15V7q0-1-1-1H9.5zM5 11.5h7V11l1 1-1 1v-.5H5v.5l-1-1 1-1z" />
  </svg>
{:else if img === 'addColLeft'}
  <svg {xmlns} {viewBox} class={style}>
    <path d="" />
  </svg>
{:else if img === 'addColRight'}
  <svg {xmlns} {viewBox} class={style}>
    <path d="" />
  </svg>
{:else if img === 'addRowAbove'}
  <svg {xmlns} {viewBox} class={style}>
    <path d="" />
  </svg>
{:else if img === 'addRowBelow'}
  <svg {xmlns} {viewBox} class={style}>
    <path d="" />
  </svg>
{:else if img === 'removeCol'}
  <svg {xmlns} {viewBox} class={style}>
    <path d="" />
  </svg>
{:else if img === 'removeRow'}
  <svg {xmlns} {viewBox} class={style}>
    <path d="" />
  </svg>
{/if}
