<script lang="ts">
  import type { Readable } from 'svelte/store'
  import type { Editor } from 'svelte-tiptap'

  import Bold from './buttons/Bold.svelte'
  import Comment from './buttons/Comment.svelte'
  import Images from './buttons/Images.svelte'
  import List from './buttons/List.svelte'
  import TextColor from './buttons/TextColor.svelte'
  import Alignment from './buttons/Alignment.svelte'
  import Table from './buttons/Table.svelte'
  import DescriptionExport from './buttons/DescriptionExport.svelte'
  import DescriptionImport from './buttons/DescriptionImport.svelte'

  export let editor: Readable<Editor> | undefined
</script>

<div>
  <Bold {editor} />
  <Comment {editor} />
  <Images {editor} />
  <List {editor} />
  <TextColor {editor} />
  <Alignment {editor} />
  <Table {editor} />
  <DescriptionImport {editor} />
  <DescriptionExport {editor} />
</div>

<style>
  div {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
  }
</style>
