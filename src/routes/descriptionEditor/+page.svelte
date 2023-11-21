<script lang="ts">
  import '../styles.scss'

  import { onMount } from 'svelte'
  import type { Readable } from 'svelte/store'
  import { createEditor, Editor, EditorContent } from 'svelte-tiptap'
  import { extensions, BubbleLink } from '$lib'
  import MenuButtons from '$lib/editor/MenuButtons.svelte'
  let editor: Readable<Editor>

  onMount(() => {
    editor = createEditor({
      extensions,
      // add placeholder lore impusm every line should be in div in content
      content: `
        <div>Lorem ipsum dolor sit amet,</div>
        <div>consectetur adipiscing elit,</div>
        <div>sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</div>
        <div>Ut enim ad minim veniam,</div>
        <div>quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.</div>
        <div>Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.</div>
        <div>Excepteur sint occaecat cupidatat non proident,</div>
        <div>sunt in culpa qui officia deserunt mollit anim id est laborum.</div>
      `,
    })
  })

  const click = () => {
    console.log($editor.getJSON())
  }
</script>

<div>
  <button on:click={() => $editor.commands.addExport()}>export</button>
</div>
<div>
  <button
    on:click={() => {
      $editor.chain().focus().setDiv().run()
    }}>div</button
  >
</div>

{#if editor}
  <MenuButtons {editor} />
{/if}

<EditorContent editor={$editor}></EditorContent>
<BubbleLink {editor} />

<button on:click={click}>click me</button>
