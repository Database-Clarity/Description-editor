<script lang="ts">
  import type { Readable } from 'svelte/store'
  import type { Editor } from 'svelte-tiptap'
  import { imageNames, images, type ImageNames } from './images'
  import DropDown from '$lib/components/DropDown.svelte'

  export let editor: Readable<Editor> | undefined

  const setImg = (imgName: ImageNames) => {
    $editor?.commands.deleteSelection()
    $editor?.commands.setImage(imgName)
  }
</script>

<DropDown>
  <svelte:fragment slot="button">
    <span>images</span>
  </svelte:fragment>

  <svelte:fragment slot="content">
    {#each imageNames as imageName}
      <button on:click={() => setImg(imageName)}>
        <span class={`${images[imageName].class} img`}>{images[imageName].img}</span>
        <span class="text">{imageName}</span>
      </button>
    {/each}
  </svelte:fragment>
</DropDown>

<style>
  button {
    font-family: inherit;
    cursor: pointer;
    text-align: start;
  }
  .img {
    display: inline-block;
    text-align: center;
    /* width: 28px; */
  }
  .text {
    vertical-align: top;
  }
</style>
