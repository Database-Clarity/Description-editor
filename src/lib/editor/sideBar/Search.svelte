<script lang="ts">
let search = $state<string>('')
</script>

<dialog></dialog>

<input type="search" placeholder="Search" bind:value={search} />
