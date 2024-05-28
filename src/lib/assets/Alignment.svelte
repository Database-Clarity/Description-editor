<script lang="ts">
type Alignment = {
  align: 'left' | 'center' | 'right'
}

const { align }: Alignment = $props()

const fill = '#d9d9d9'

const className = 'h-5 w-6 fill-'
</script>

{#if align === 'left'}
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" {fill} class={className}>
    <path
      d="m14 17a1 1 0 010 2H3a1 1 0 010-2h11zm7-6a1 1 0 010 2H3a1 1 0 010-2h18zm-3-6a1 1 0 010 2H3a1 1 0 010-2h15z"
    />
  </svg>
{:else if align === 'center'}
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" {fill}>
    <path
      d="m17 17a1 1 0 110 2H7a1 1 0 110-2h10zm4-6a1 1 0 010 2H3a1 1 0 010-2h18zm-2-6a1 1 0 110 2H5a1 1 0 110-2h14z"
    />
  </svg>
{:else if align === 'right'}
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" {fill}>
    <path
      d="m21 17a1 1 0 110 2H10a1 1 0 110-2h11zm0-6a1 1 0 010 2H3a1 1 0 010-2h18zm0-6a1 1 0 110 2H6a1 1 0 110-2h15z"
    />
  </svg>
{/if}

<style lang="postcss">
svg {
  @apply h-5 w-6;
}
</style>
