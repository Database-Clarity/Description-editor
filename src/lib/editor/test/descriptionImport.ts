import { Node, mergeAttributes } from '@tiptap/core'
import type { PendingQuery, Perk } from '$lib/types'

import DescriptionImport from './DescriptionImport.svelte'
import SvelteNodeViewRenderer from '$lib/tiptap/node.svelte'
import { writable } from 'svelte/store'

/**
 * It is used for one edge case and that is only place it should be used.
 */
export const descriptionImportStore = writable<PendingQuery<Perk[]>>()

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    descriptionImport: {
      /**
       * insert a counter component
       */
      addDescriptionImport: () => ReturnType
    }
  }
}

export const DescriptionImportExtension = Node.create({
  name: 'descriptionImport',
  group: 'block',
  content: 'inline*',
  draggable: true, // Optional: to make the node draggable

  addAttributes() {
    return {
      count: {
        default: 0,
      },
    }
  },

  parseHTML() {
    return [{ tag: 'descriptionImport' }]
  },

  renderHTML({ HTMLAttributes }) {
    return ['descriptionImport', mergeAttributes(HTMLAttributes)]
  },

  addNodeView() {
    return SvelteNodeViewRenderer(DescriptionImport)
  },

  addCommands() {
    return {
      addDescriptionImport:
        () =>
        ({ commands }) => {
          return commands.setNode(this.name)
        },
    }
  },
})
