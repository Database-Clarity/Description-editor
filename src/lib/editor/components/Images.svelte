<script lang="ts">
import type { Writable } from 'svelte/store'
import type { Editor } from '@tiptap/core'
import { imageNames, type ImageNames } from '../extensions/images'
import Bungie from '$lib/assets/Bungie.svelte'
import Button from './Button.svelte'

let { editor }: { editor: Writable<Editor | undefined> } = $props()

const setImg = (imgName: ImageNames) => {
  $editor?.commands.setImage(imgName)
}

let dropdownOpen = $state<boolean>(false)
const handleFocusLoss = ({ relatedTarget, currentTarget }: FocusEvent) => {
  if (relatedTarget && (currentTarget as Node)?.contains(relatedTarget as Node)) return
  dropdownOpen = false
}

let randomImgName = $derived.by(() => {
  dropdownOpen // re-run when dropdownOpen changes
  return imageNames[Math.floor(Math.random() * imageNames.length)]
})
</script>

<div onfocusout={handleFocusLoss}>
  <Button onclick={() => (dropdownOpen = !dropdownOpen)}>
    <Bungie img={randomImgName} />
    <span>Images</span>
  </Button>

  {#if dropdownOpen}
    <div class="dropDownContent">
      {#each imageNames as imageName}
        <Button onclick={() => setImg(imageName)}>
          <Bungie img={imageName} />
          <span>{imageName}</span>
        </Button>
      {/each}
    </div>
  {/if}
</div>

<style lang="scss">
.dropDownContent {
  position: absolute;
  display: flex;
  flex-direction: column;
  z-index: 99;

  background-color: hsl(0, 0%, 15%);
  border-radius: 0.3rem;
}
</style>
