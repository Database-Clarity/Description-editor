<script lang="ts">
type Alignment = {
  align: 'left' | 'center' | 'right'
}

const { align }: Alignment = $props()

const className = 'h-5 px-1 fill-LM-text dark:fill-DM-text'
</script>

{#if align === 'left'}
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 24" class="{className}">
    <path
      d="m12 18a1 1 0 010 2H1a1 1 0 010-2zm7-7a1 1 0 010 2H1a1 1 0 010-2zm-3-7a1 1 0 010 2H1a1 1 0 010-2z" />
  </svg>
{:else if align === 'center'}
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 24" class={className}>
    <path
      d="m15 18a1 1 0 110 2H4a1 1 0 110-2zm4-7a1 1 0 010 2H1a1 1 0 010-2zm-2-7a1 1 0 110 2H3a1 1 0 110-2z" />
  </svg>
{:else if align === 'right'}
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 24" class={className}>
    <path
      d="m19 18a1 1 0 110 2H8a1 1 0 110-2zm0-7a1 1 0 010 2H1a1 1 0 010-2zm0-7a1 1 0 110 2H4a1 1 0 110-2z" />
  </svg>
{/if}