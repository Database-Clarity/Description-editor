<script lang="ts">
  import '../styles.scss'

  import { derived, type Readable } from 'svelte/store'
  import { createEditor, Editor, EditorContent } from 'svelte-tiptap'
  import { extensions, BubbleLink } from '$lib'
  import MenuButtons from '$lib/editor/MenuButtons.svelte'
  import { sidebarStore } from '$lib/sideBar/sidebarStore.svelte'
  import Sidebar from '$lib/sideBar/Sidebar.svelte'
  import { browser } from '$app/environment'

  export let data

  console.log(data.perks)

  // const { hash, lang, perks, descriptions, comments } = data

  // // editorStore.set(descriptions)

  // if (perks[hash]) {
  //   sidebarStore.hash = hash
  //   sidebarStore.itemHash = perks[hash].itemHash
  //   sidebarStore.type = perks[hash].type
  //   sidebarStore.language = lang
  // }

  let editor: Readable<Editor>

  // let enDescription = derived(sidebarStore, ($sidebarStore) => {
  //   const descriptions = $editorStore[$sidebarStore.hash]?.en
  //   return descriptions?.sort((a, b) => b.timestamp - a.timestamp)[0] ?? ''
  // })
  if (browser) {
    editor = createEditor({
      extensions,
      content: 'enDescription',
    })
  }

  const click = async () => {
    // const qb = new QueryBuilder()
    // const query = qb.select().from(de).where(eq(de.id, 0))
    // const { sql, params } = query.toSQL()
    // console.log(sql, params);
  }
</script>

<div class="descriptionEditor">
  <div>
    <MenuButtons {editor} />
    <div class="editor">
      <EditorContent editor={$editor} />
    </div>
  </div>

  <BubbleLink {editor} />

  <div class="sideBar">
    <Sidebar />
  </div>
</div>
<button on:click={click}>click me</button>

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
  .sideBar {
    width: 300px;
    height: 100%;
    // background-color: $sidebar-background-color;
    padding: 5px;
  }
</style>
