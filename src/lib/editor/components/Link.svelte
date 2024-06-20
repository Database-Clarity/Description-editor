<script lang="ts">
import DropDown from '$lib/components/DropDown.svelte'
import type { Writable } from 'svelte/store'
import Button from './Button.svelte'
import type { Editor } from '@tiptap/core'

let { editor }: { editor: Writable<Editor | undefined> } = $props()

const links = [
  { name: 'Google', url: 'https://www.google.com' },
  { name: 'Facebook', url: 'https://www.facebook.com' },
  { name: 'Twitter', url: 'https://www.twitter.com' },
  { name: 'Instagram', url: 'https://www.instagram.com' },
]

const setLink = (url: string) => {
  $editor?.chain().focus().setLink({ href: url }).run()
}
</script>

<DropDown class="flex flex-col rounded bg-LM-15 dark:bg-DM-15">
  {#snippet button(onclick)}
    <Button {onclick}>
      <span>Link</span>
    </Button>
  {/snippet}

  {#each links as { name, url }}
    <Button onclick={() => setLink(url)}>
      <span class="pl-1">{name}</span>
    </Button>
  {/each}
  <Button onclick={() => setLink('')}>
    <span class="text-nowrap pl-1">Custom URL</span>
  </Button>
</DropDown>

<dialog>
  <div>
    <label for="link">Link</label>
    <input type="text" id="link" />
  </div>
</dialog>
