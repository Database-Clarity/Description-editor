<script lang="ts">
import type { Writable } from 'svelte/store'
import type { Editor } from '@tiptap/core'
import { imageNames, type ImageNames } from '../extensions/images'
import Bungie from '$lib/assets/Bungie.svelte'
import Button from './Button.svelte'
import DropDown from '$lib/components/DropDown.svelte'

let {
  editor,
}: {
  editor: Writable<Editor | undefined>
} = $props()

const setImg = (imgName: ImageNames) => {
  $editor?.commands.setImage(imgName)
}
</script>

<DropDown class="flex flex-col rounded bg-LM-15 dark:bg-DM-15">
  {#snippet button(onclick)}
    <Button {onclick}>
      <Bungie img={'strand'} />
      <span>Images</span>
    </Button>
  {/snippet}

  {#each imageNames as imageName}
    <Button onclick={() => setImg(imageName)}>
      <Bungie img={imageName} />
      <span class="w-[4.5rem] overflow-hidden text-ellipsis whitespace-nowrap text-start capitalize">{imageName}</span>
    </Button>
  {/each}
</DropDown>
