<script lang="ts">
import type { Editor } from '@tiptap/core'
import type { Writable } from 'svelte/store'
import { toNormalText } from '$lib/utils'
import Bold from '$lib/assets/Bold.svelte'
import BulletList from '$lib/assets/BulletList.svelte'
import Comment from '$lib/assets/Comment.svelte'
import Button from './Button.svelte'
import Highlight from '$lib/assets/Highlight.svelte'

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

const toggle = () => {
  $editor?.commands[`toggle${toNormalText(type)}`]()
}

let active = $derived<boolean>($editor?.isActive(type) || false)
</script>

<Button onclick={toggle} {active} {title}>
  <svelte:component this={SVGs[type]} />
  {#if displayText}
    <span
      >{type
        .split(/([A-Z]\w+)/)
        .join(' ')
        .trim()}</span>
  {/if}
</Button>
