<svelte:options runes={true} />

<script lang="ts">
import NodeViewWrapper from '$lib/tiptap/NodeViewWrapper.svelte'
import type { Writable } from 'svelte/store'
import Button from '../components/Button.svelte'

let {
  attrs,
}: {
  attrs?: Writable<{
    count: number
  }>
} = $props()

const handleClick = () => {
  $attrs!.count += 1
}
</script>

<NodeViewWrapper>
  <div class="drag-handle" contenteditable="false" draggable="true" data-drag-handle></div>
  <span>Svelte Component</span>

  <div>
    <!-- TODO: change to onclick then bug is fixed -->
    <Button onclick={handleClick}>This button has been clicked times. {$attrs!.count}</Button>
  </div>
</NodeViewWrapper>

<style>
.drag-handle {
  flex: 0 0 auto;
  position: relative;
  width: 1rem;
  height: 1rem;
  top: 0.3rem;
  margin-right: 0.5rem;
  cursor: grab;
  background-image: url('data:image/svg+xml;charset=UTF-8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 10 16"><path fill-opacity="0.2" d="M4 14c0 1.1-.9 2-2 2s-2-.9-2-2 .9-2 2-2 2 .9 2 2zM2 6C.9 6 0 6.9 0 8s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0-6C.9 0 0 .9 0 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm6 4c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" /></svg>');
  background-repeat: no-repeat;
  background-size: contain;
  background-position: center;
}
</style>
