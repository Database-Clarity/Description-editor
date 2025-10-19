<script lang="ts">
import type { Editor } from '@tiptap/core'
import type { Writable } from 'svelte/store'
import { toNormalText } from '$lib/utils'
import Bold from '$lib/assets/Bold.svelte'
import BulletList from '$lib/assets/BulletList.svelte'
import Comment from '$lib/assets/Comment.svelte'
import Button from './Button.svelte'
import Highlight from '$lib/assets/textFormatting/Highlight.svelte'

import './test.css'

const {
  editor,
  type,
  title,
  displayText = true,
}: {
  editor: Writable<Editor | undefined>
  type: 'bold' | 'bulletList' | 'comment' | 'enhanced' | 'highlight'
  title: string
  displayText?: boolean
} = $props()

const SVGs = {
  bold: Bold,
  bulletList: BulletList,
  comment: Comment,
  enhanced: Bold,
  highlight: Highlight,
}

const test123 = ['test', 'test2']

$effect(() => console.log($editor?.isActive(type)))

let active = $derived<boolean>($editor?.isActive(type) || false)
</script>

<Button class="rounded">
  {@const Svg = SVGs[type]}
  <Svg></Svg>
  {#if displayText}
    <span>
      {type
        .split(/([A-Z]\w+)/)
        .join(' ')
        .trim()}
    </span>
  {/if}
</Button>

<style>
:global(.rounded) {
  height: 1.5rem;
  border-radius: 0.25rem;
  background-color: green;
}
</style>
