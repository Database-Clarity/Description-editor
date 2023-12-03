<script lang="ts">
  import '../styles.scss'

  import { onMount } from 'svelte'
  import { writable, type Readable } from 'svelte/store'
  import { createEditor, Editor, EditorContent } from 'svelte-tiptap'
  import { extensions, BubbleLink } from '$lib'
  import MenuButtons from '$lib/editor/MenuButtons.svelte'

  export let data
  const { hash, perks, descriptions, comments } = data

  // store beginning
  import { page } from '$app/stores'
  const { set, subscribe, update } = writable({
    hash,
    perks,
    descriptions,
    comments,
  })

  const mainStore = {
    subscribe,
    set,
    update,
  }

  // update url with new hash
  mainStore.subscribe((value) => {
    const hashParam = Number($page.url.searchParams.get('hash'))
    if (hashParam !== value.hash) {
      $page.url.searchParams.set('hash', String(value.hash))
      history.pushState(null, '', $page.url.toString())
    }
  })
  // store end

  let editor: Readable<Editor>

  onMount(() => {
    editor = createEditor({
      extensions,
      content: $mainStore.descriptions[hash].description,
    })
  })

  const click = () => {
    console.log($editor.getJSON())
  }
</script>

{#if editor}
  <MenuButtons {editor} />
{/if}

<EditorContent editor={$editor}></EditorContent>
<BubbleLink {editor} />

<button on:click={click}>click me</button>

<div class="sideBar"></div>
