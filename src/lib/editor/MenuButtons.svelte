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

  export let editor: Readable<Editor> | undefined
</script>

<Bold {editor} />
<Comment {editor} />
<Images {editor} />
<List {editor} />
<TextColor {editor} />
<Alignment {editor} />
<Table {editor} />
