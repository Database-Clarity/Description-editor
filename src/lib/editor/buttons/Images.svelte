<script lang="ts">
  import type { Readable } from 'svelte/store'
  import type { Editor } from 'svelte-tiptap'
  import { imageNames, images, type ImageNames } from './images'

  export let editor: Readable<Editor> | undefined

  let randomImgName = imageNames[Math.floor(Math.random() * imageNames.length)]

  const setRandomImgName = () => {
    randomImgName = imageNames[Math.floor(Math.random() * imageNames.length)]
  }

  const setImg = (imgName: ImageNames) => {
    $editor?.commands.deleteSelection()
    $editor?.commands.setImage(imgName)
  }

  let dropdownOpen = false
  const handleFocusLoss = ({ relatedTarget, currentTarget }: FocusEvent) => {
    if (relatedTarget && (currentTarget as Node)?.contains(relatedTarget as Node)) return
    dropdownOpen = false
    setRandomImgName()
  }
  const openCloseDropdown = () => {
    dropdownOpen = !dropdownOpen
    setRandomImgName()
  }
</script>

<div on:focusout={handleFocusLoss} class="dropDown">
  <button on:click={openCloseDropdown}>
    <span class={`${images[randomImgName].class} img`}>{images[randomImgName].img}</span>
    <span class="text">Images</span>
  </button>

  {#if dropdownOpen}
    <div class="dropDownContent">
      {#each imageNames as imageName}
        <button on:click={() => setImg(imageName)}>
          <span class={`${images[imageName].class} img`}>{images[imageName].img}</span>
          <span class="text">{imageName}</span>
        </button>
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
  button {
    font-family: inherit;
    display: flex;
    flex-direction: row;
    flex-wrap: nowrap;
    align-items: center;
    cursor: pointer;
    gap: 6px;
    width: 125px;
    height: 23px;

    background-color: hsl(0, 0%, 15%);
    border: none;
    border-radius: 5px;
    color: inherit;
    &:hover {
      background-color: hsl(0, 0%, 20%);
    }
  }
  .img {
    width: 30px;
    font-size: large;
  }
  span {
    text-transform: capitalize;
  }
</style>
