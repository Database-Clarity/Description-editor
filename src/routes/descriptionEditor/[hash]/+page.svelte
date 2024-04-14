<script lang="ts">
  import '../../styles.scss'

  import { type Readable } from 'svelte/store'
  import { createEditor, Editor, EditorContent } from 'svelte-tiptap'
  import { extensions, BubbleLink } from '$lib'
  import MenuButtons from '$lib/editor/MenuButtons.svelte'
  // import Selection from '$lib/sideBar/Selection.svelte'
  import { browser } from '$app/environment'

  // export let data

  let editor: Readable<Editor>

  if (browser) {
    editor = createEditor({
      extensions,
      content: 'enDescription',
    })
  }
</script>

<!-- <div class="descriptionEditor">
  <div>
    <MenuButtons {editor} />
    <div class="editor">
      <EditorContent editor={$editor} />
    </div>
  </div>

  <BubbleLink {editor} />
</div> -->

<style lang="scss">
  .descriptionEditor {
    display: flex;
  }

  @import '/src/variables.scss';
  .editor {
    height: $editor-height;
    background-color: $editor-background-color;
    padding: 5px;
  }
  .sidebar {
    width: 300px;
    height: 100%;
    // background-color: $sidebar-background-color;
    padding: 5px;
  }
</style>
