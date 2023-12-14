<script lang="ts">
  import '../styles.scss'

  import type { Readable } from 'svelte/store'
  import { createEditor, Editor, EditorContent } from 'svelte-tiptap'
  import { extensions, BubbleLink } from '$lib'
  import MenuButtons from '$lib/editor/MenuButtons.svelte'
  import { sidebarStore } from '$lib/sideBar/sidebarStore'
  import Sidebar from '$lib/sideBar/Sidebar.svelte'
  import { browser } from '$app/environment'

  export let data
  const { hash, language, perks, descriptions, comments } = data

  if (perks[hash]) {
    $sidebarStore.hash = hash
    $sidebarStore.itemHash = perks[hash].itemHash
    $sidebarStore.type = perks[hash].type
    $sidebarStore.language = language
  }

  let editor: Readable<Editor>
  if (browser) {
    editor = createEditor({
      extensions,
      content: descriptions[$sidebarStore.hash]?.[$sidebarStore.language] || '',
    })
  }

  const click = () => {
    console.log($editor.getJSON())
  }
</script>

<MenuButtons {editor} />

<div class="editor">
  <EditorContent editor={$editor} />
</div>

<BubbleLink {editor} />

<button on:click={click}>click me</button>

<Sidebar {perks} />

<style lang="scss">
  @import '/src/variables.scss';
  .editor {
    height: $editor-height;
    background-color: $editor-background-color;
    padding: 5px;
  }
</style>
