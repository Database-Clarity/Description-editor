<script lang="ts">
import DropDown from '$lib/components/DropDown.svelte'
import type { Writable } from 'svelte/store'
import Button from './Button.svelte'
import type { Editor } from '@tiptap/core'
import Link from '$lib/assets/Link.svelte'

let {
  editor,
  displayText = true,
}: {
  editor: Writable<Editor | undefined>
  displayText?: boolean
} = $props()

const links = [
  { name: 'Damage Buffs', url: 'https://url.d2clarity.com/DamageBuffs' },
  { name: 'Scaling', url: 'https://url.d2clarity.com/combatant-scaling' },
  { name: 'Classifications', url: 'https://url.d2clarity.com/combatants' },
]

const setLink = (url: string) => {
  // select all text inside of link mark and set mark
  $editor?.chain().extendMarkRange('link').setLink({ href: url }).run()
}
const removeLink = () => {
  // select all text inside of link mark and remove mark
  $editor?.chain().extendMarkRange('link').unsetLink().run()
}
</script>

<DropDown class="flex flex-col rounded bg-LM-15 dark:bg-DM-15">
  {#snippet button(onclick)}
    <Button {onclick}>
      <Link />
      {#if displayText}
        <span>Link</span>
      {/if}
    </Button>
  {/snippet}

  {#each links as { name, url }}
    <Button onclick={() => setLink(url)}>
      <span class="w-28 pl-1">{name}</span>
    </Button>
  {/each}
  <Button onclick={() => setLink('')}>
    <span class="pl-1">Custom URL</span>
  </Button>
  <Button onclick={() => removeLink()}>
    <span class="pl-1">Remove</span>
  </Button>
</DropDown>

<dialog>
  <div>
    <label for="link">Link</label>
    <input type="text" id="link" />
  </div>
</dialog>
