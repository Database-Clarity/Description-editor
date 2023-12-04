<script lang="ts">
  import '../styles.scss'

  import { onMount } from 'svelte'
  import type { Readable } from 'svelte/store'
  import { createEditor, Editor, EditorContent } from 'svelte-tiptap'
  import { extensions, BubbleLink } from '$lib'
  import MenuButtons from '$lib/editor/MenuButtons.svelte'
  import { sidebarStore } from '$lib/sideBar/sidebarStore'

  export let data
  const { hash, perks, descriptions, comments } = data

  let editor: Readable<Editor>

  onMount(() => {
    editor = createEditor({
      extensions,
      content: descriptions[hash].description,
    })
  })

  const click = () => {
    $sidebarStore.hash++
  }
</script>

{#if editor}
  <MenuButtons {editor} />
{/if}

<EditorContent editor={$editor}></EditorContent>
<BubbleLink {editor} />

<button on:click={click}>click me</button>
