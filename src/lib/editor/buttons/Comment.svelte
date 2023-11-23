<script lang="ts">
  import type { Readable } from 'svelte/store'
  import type { Editor } from 'svelte-tiptap'
  import comment from '$lib/assets/comment.svg'
  export let editor: Readable<Editor> | undefined

  $: commentActive = $editor?.isActive('comment')
  const toggleComment = () => {
    $editor?.commands.toggleComment()
  }
</script>

<button on:click={toggleComment} class:commentActive title="CTRL + B / ⌘ + B">
  <img src={comment} alt="comment" />
  <span class="text">Comment</span>
</button>

<style lang="scss">
  .commentActive {
    background-color: red;
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
      height: 18px;
    }
  }
</style>
