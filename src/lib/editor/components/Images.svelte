<script lang="ts">
import type { Writable } from 'svelte/store'
import type { Editor } from '@tiptap/core'
import { imageNames, type ImageNames } from '../extensions/images'
import images from '$lib/assets/bungie/svgExport'
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

<div onfocusout={handleFocusLoss} class="dropDown">
  <Button onclick={() => (dropdownOpen = !dropdownOpen)}>
    <img src={images[randomImgName]} alt={randomImgName} />
    <span>Images</span>
  </Button>

  {#if dropdownOpen}
    <div class="dropDownContent">
      {#each imageNames as imageName}
        <Button onclick={() => setImg(imageName)}>
          <img src={images[imageName]} alt={randomImgName} />
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
  border-radius: 5px;
}
</style>
