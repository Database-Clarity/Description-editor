<script lang="ts">
import './editorStyles.scss'
import { extensions } from '$lib'
import Alignment from '$lib/editor/components/Alignment.svelte'
import SvelteTiptap from '$lib/tiptap/SvelteTiptap.svelte'
import type { EditorSettings } from '$lib/tiptap/tipTapTypes'
import type { Editor } from '@tiptap/core'
import { writable } from 'svelte/store'
import EditorButton from '$lib/editor/components/EditorButton.svelte'
import TextColor from '$lib/editor/components/TextColor.svelte'
import Images from '$lib/editor/components/Images.svelte'
import Table from '$lib/editor/components/Table.svelte'
import { beforeNavigate, afterNavigate } from '$app/navigation'
import Selection from '$lib/editor/sideBar/Selection.svelte'

const { data } = $props()

const editorSettings: EditorSettings = {
  extensions: extensions,
  content: ``,
}

const editor = writable<Editor | undefined>()

afterNavigate(({ to }) => {
  const hash = to?.params?.hash
  if (hash === undefined) return

  data.descriptionPromise.then((description) => {
    $editor?.commands.setContent(description[0]?.description ?? '')
  })
})

// Upload description to server
beforeNavigate(({ from, to }) => {
  const hash = from?.params?.hash

  if (
    // Kill it if:
    hash === undefined || // Hash is missing
    hash === to?.params?.hash || // User navigates to the same page
    $editor?.getText().trim() === '' // Editor is empty
  ) {
    return
  }

  fetch('/descriptionEditor', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      lang: 'en',
      description: $editor?.getJSON(),
      live: false,
      ready: false,
      hash: hash,
      username: 'Icemourne',
    }),
  })
})
</script>

<div class="editor">
  <div>
    <div class="buttons">
      <Alignment {editor} />
      <EditorButton {editor} type="bold" title="CTRL + B / ⌘ + B" />
      <EditorButton {editor} type="bulletList" title="TAB" />
      <EditorButton {editor} type="comment" title="CTRL + /" />
      <TextColor {editor} />
      <Images {editor} />

      <Table {editor} />
    </div>
    <div class="descriptionEditor editorStyles">
      <!-- TODO: Are booth classes needed? -->
      <SvelteTiptap {editor} {editorSettings} />
    </div>
  </div>
  <Selection perksPromise={data.perksPromise} lang={data.lang} {editor} hash={data.hash} />
</div>

<style lang="scss">
.editor {
  display: flex;
  gap: 10px;
}
.buttons {
  display: flex;
  gap: 5px;
  padding: 5px;
}
.descriptionEditor {
  height: 50vh;
}

@font-face {
  font-family: D2 Clarity fonts;
  src: url(/D2-Clarity-fonts.woff);
}
</style>
