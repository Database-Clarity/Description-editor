<script lang="ts">
  import type { Readable } from 'svelte/store'
  import type { Editor } from 'svelte-tiptap'
  import bulletListsSVG from '$lib/assets/bulletLists.svg'

  export let editor: Readable<Editor> | undefined

  $: active = $editor?.isActive('bulletList')
  const toggleList = () => {
    $editor?.chain().focus().toggleBulletList().run()
  }
</script>

<button on:click={toggleList} class:active title="TAB">
  <img src={bulletListsSVG} alt="bullet lists" />
  <span class="text">Bullet list</span>
</button>

<style lang="scss">
  .active {
    background-color: hsl(0, 0%, 20%);
  }

  button {
    font-family: inherit;
    display: flex;
    flex-direction: row;
    flex-wrap: nowrap;
    align-items: center;
    cursor: pointer;
    gap: 6px;
    height: 23px;

    background-color: hsl(0, 0%, 15%);
    border: none;
    border-radius: 5px;
    color: inherit;
    &:hover {
      background-color: hsl(0, 0%, 20%);
    }
    img {
      height: 20px;
    }
  }
</style>
