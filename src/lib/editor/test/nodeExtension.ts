import { Node, mergeAttributes } from '@tiptap/core'

import CounterComponent from './Counter.svelte'
import SvelteNodeViewRenderer from '$lib/tiptap/node.svelte'

export const SvelteCounterExtension = Node.create({
  name: 'svelteCounterComponent',
  group: 'block',
  atom: true,
  draggable: true, // Optional: to make the node draggable
  inline: false,

  addAttributes() {
    return {
      count: {
        default: 0,
      },
    }
  },

  parseHTML() {
    return [{ tag: 'svelte-counter-component' }]
  },

  renderHTML({ HTMLAttributes }) {
    return ['svelte-counter-component', mergeAttributes(HTMLAttributes)]
  },

  addNodeView() {
    return SvelteNodeViewRenderer(CounterComponent)
  },
})
