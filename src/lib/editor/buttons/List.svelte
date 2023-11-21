<script lang="ts">
  import type { Readable } from 'svelte/store'
  import type { Editor } from 'svelte-tiptap'

  export let editor: Readable<Editor> | undefined

  const toggleList = () => {
    $editor?.chain().focus().toggleBulletList().run()
  }
</script>

<button on:click={toggleList} title="TAB">list item</button>
