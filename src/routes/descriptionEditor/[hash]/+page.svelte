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
import PerkSelection from '$lib/editor/sideBar/Selection.svelte'
import { cookiesFromString } from '$lib/utils'
import Link from '$lib/editor/components/Link.svelte'
import { converter } from '$lib/editor/converter/converter'
import Tooltip from '$lib/editor/components/Tooltip.svelte'
import Meta from './Meta.svelte'

const { data } = $props()

const editorSettings: EditorSettings = {
  extensions: extensions,
  content: ``,
}

const mainEditor = writable<Editor | undefined>()
const secondEditor = writable<Editor | undefined>()

afterNavigate(({ to }) => {
  const hash = to?.params?.hash
  if (hash === undefined) return

  data.descriptionPromise.then((description) => {
    $mainEditor?.commands.setContent(description[0]?.description ?? '')
  })
})

// Upload description to server
beforeNavigate(({ from, to }) => {
  const hash = from?.params?.hash

  const { username, role } = cookiesFromString(document.cookie, ['username', 'role'])

  if (
    // Kill it if data is missing
    !hash ||
    !$mainEditor ||
    !username ||
    !role
  ) {
    return
  }

  if (
    // Kill it if:
    hash === to?.params?.hash || // User navigates to the same page
    hash === '0' || // User navigates to the home page
    (role !== 'admin' && role !== 'editor') // User is not an admin or editor
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
      description: $mainEditor?.getHTML(),
      live: false,
      ready: false,
      hash: hash,
    }),
  })
})

const dump = () => {
  console.log($mainEditor?.getHTML())
}

const getOldDescription = async () => {
  const hash = data.hash
  if (hash === undefined) return

  const description = await fetch(
    `https://raw.githubusercontent.com/Database-Clarity/Live-Clarity-Database/intermediate/intermediateDescriptions.json`
  )
    .then((res) => res.json())
    .then((data) => data.perks[hash]?.editor?.en?.main)

  if (description === undefined) return
  $mainEditor?.commands.setContent(converter(description))
}
</script>

<div class="flex flex-row flex-wrap justify-center gap-2">
  <div class="editorContainer">
    <div class="flex flex-row flex-wrap gap-1 p-1">
      <Alignment editor={mainEditor} />
      <EditorButton editor={mainEditor} type="bold" title="CTRL + B / ⌘ + B" />
      <EditorButton editor={mainEditor} type="bulletList" title="TAB" />
      <EditorButton editor={mainEditor} type="comment" title="CTRL + /" />
      <EditorButton editor={mainEditor} type="enhanced" title="" />
      <EditorButton editor={mainEditor} type="highlight" title="" />
      <TextColor editor={mainEditor} />
      <Images editor={mainEditor} />
      <Table editor={mainEditor} />
      <Link editor={mainEditor} />
      <Tooltip editor={mainEditor} />
    </div>
    <div class="editorStyles firstEditor bg-tint-dark px-2">
      <SvelteTiptap editor={mainEditor} {editorSettings}>
        {#snippet bubbleMenu()}
          <div class="bubbleMenu">
            <EditorButton editor={mainEditor} type="bold" title="CTRL + B / ⌘ + B" displayText={false} />
            <EditorButton editor={mainEditor} type="comment" title="CTRL + /" displayText={false} />
            <EditorButton editor={mainEditor} type="enhanced" title="" displayText={false} />
            <EditorButton editor={mainEditor} type="highlight" title="" displayText={false} />
            <TextColor editor={mainEditor} displayText={false} />
            <Link editor={mainEditor} displayText={false} />
          </div>
        {/snippet}
      </SvelteTiptap>
    </div>
    <div class="editorStyles secondEditor bg-tint-dark px-2">
      <SvelteTiptap editor={secondEditor} {editorSettings} />
    </div>
  </div>
  <PerkSelection perksPromise={data.perksPromise} lang={data.lang} editor={mainEditor} hash={data.hash} />
</div>

<button onclick={dump}>dump</button>
<button onclick={getOldDescription}>getOldDescription</button>

<Meta hash={data.hash} />

<style>
.bubbleMenu {
  display: flex;
  gap: 0.3rem;
  padding: 0.3rem;
  background-color: hsla(0, 0%, 30%, 0.7);
  border-radius: 0.3rem;
  box-shadow: 0 0 0.3rem 0 hsla(0, 0%, 0%, 0.2);
}

.editorContainer {
  max-width: 1192px;
  .firstEditor {
    height: 50vh;
  }
  .secondEditor {
    height: 40vh;
    border-top: 0.3rem solid hsla(0, 0%, 100%, 0.2);
  }
}

@font-face {
  font-family: D2 Clarity fonts;
  src: url(/D2-Clarity-fonts.woff);
}
</style>
