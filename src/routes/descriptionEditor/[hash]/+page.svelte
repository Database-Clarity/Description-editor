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
import { descriptionImportStore } from '$lib/editor/test/descriptionImport'
import { cookiesFromString } from '$lib/utils'
import Link from '$lib/editor/components/Link.svelte'

const { data } = $props()

// Consumed by description import component
descriptionImportStore.set(data.perksPromise)

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

  const { username, role } = cookiesFromString(document.cookie, ['username', 'role'])

  if (
    // Kill it if data is missing
    !hash ||
    !$editor ||
    !username ||
    !role
  ) {
    return
  }

  if (
    // Kill it if:
    hash === to?.params?.hash || // User navigates to the same page
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
      description: $editor?.getHTML(),
      live: false,
      ready: false,
      hash: hash,
    }),
  })
})

const dump = () => {
  console.log($editor?.getHTML())
}
</script>

<div class="flex flex-row flex-wrap justify-center gap-2">
  <div>
    <div class="flex flex-row flex-wrap gap-1 p-1">
      <Alignment {editor} />
      <EditorButton {editor} type="bold" title="CTRL + B / ⌘ + B" />
      <EditorButton {editor} type="bulletList" title="TAB" />
      <EditorButton {editor} type="comment" title="CTRL + /" />
      <EditorButton {editor} type="import" title="" />
      <EditorButton {editor} type="enhanced" title="" />
      <EditorButton {editor} type="highlight" title="" />
      <TextColor {editor} />
      <Images {editor} />
      <Table {editor} />
      <Link {editor} />
    </div>
    <div class="editorStyles h-[60vh] bg-tint-dark px-2">
      <SvelteTiptap {editor} {editorSettings}>
        {#snippet bubbleMenu()}
          <div class="bubbleMenu">
            <EditorButton {editor} type="bold" title="CTRL + B / ⌘ + B" />
            <EditorButton {editor} type="comment" title="CTRL + /" />
            <EditorButton {editor} type="enhanced" title="" />
            <EditorButton {editor} type="highlight" title="" />
            <TextColor {editor} />
            <Link {editor} />
          </div>
        {/snippet}
      </SvelteTiptap>
    </div>
  </div>
  <PerkSelection perksPromise={data.perksPromise} lang={data.lang} {editor} hash={data.hash} />
</div>

<button onclick={dump}>dump</button>

<svelte:head>
  <!-- {#await data.perksPromise then value} -->
  <!-- HTML Meta Tags -->
  <title>Clarity Description Editor</title>
  <meta name="description" content={`Description for figure out how to add perk name`} />

  <!-- Facebook Meta Tags -->
  <meta property="og:url" content={`https://description-editor.vercel.app/descriptionEditor/${data.hash}`} />
  <meta property="og:type" content="website" />
  <meta property="og:title" content="Clarity Description Editor" />
  <meta property="og:description" content={`Description for figure out how to add perk name`} />
  <meta property="og:image" content="" />

  <!-- Twitter Meta Tags -->
  <meta name="twitter:card" content="summary_large_image" />
  <meta property="twitter:domain" content="description-editor.vercel.app" />
  <meta property="twitter:url" content={`https://description-editor.vercel.app/descriptionEditor/${data.hash}`} />
  <meta name="twitter:title" content="Clarity Description Editor" />
  <meta name="twitter:description" content={`Description for figure out how to add perk name`} />
  <meta name="twitter:image" content="" />
  <!-- {/await} -->
</svelte:head>

<style>
.bubbleMenu {
  display: flex;
  gap: 0.3rem;
  padding: 0.3rem;
  background-color: hsla(0, 0%, 30%, 0.7);
  border-radius: 0.3rem;
  box-shadow: 0 0 0.3rem 0 hsla(0, 0%, 0%, 0.2);
}

@font-face {
  font-family: D2 Clarity fonts;
  src: url(/D2-Clarity-fonts.woff);
}
</style>
