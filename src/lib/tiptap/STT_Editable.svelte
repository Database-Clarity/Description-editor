<script lang="ts">
const {
  as = 'div',
  ...restProps
}: {
  as?: string
} = $props()
</script>

<svelte:element this={as} style="white-space: normal;" data-node-view-content="" role="none" {...restProps}>
</svelte:element>
