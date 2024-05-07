<script lang="ts">
import type { Editor } from '@tiptap/core'
import type { Writable } from 'svelte/store'
import { capitalizeFirstLetter } from '$lib/utils'
import Bold from '$lib/assets/Bold.svelte'
import BulletList from '$lib/assets/BulletList.svelte'
import Comment from '$lib/assets/Comment.svelte'
import Button from './Button.svelte'

const {
  editor,
  type,
  title,
}: {
  editor: Writable<Editor | undefined>
  type: 'bold' | 'bulletList' | 'comment'
  title: string
} = $props()

const SVGs = {
  bold: Bold,
  bulletList: BulletList,
  comment: Comment,
}

const toggle = () => {
  $editor?.commands[`toggle${capitalizeFirstLetter(type)}`]()
}

let active = $derived<boolean>($editor?.isActive(type) || false)
</script>

<Button onclick={toggle} {active} {title}>
  <svelte:component this={SVGs[type]} />
  <span>{type}</span>
</Button>
