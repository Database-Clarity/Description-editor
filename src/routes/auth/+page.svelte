<script lang="ts">
import { onMount } from 'svelte'

const { data } = $props()

onMount(() => {
  if (data.success) {
    window.close()
  }
})
</script>

<h1>Failed authentication</h1>
