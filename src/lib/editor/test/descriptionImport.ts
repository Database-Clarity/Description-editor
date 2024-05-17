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
  content: 'block*',
  // draggable: true, // Optional: to make the node draggable

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
    return ['descriptionImport', mergeAttributes(HTMLAttributes), 0]
  },

  addNodeView() {
    return SvelteNodeViewRenderer(DescriptionImport)
  },

  addCommands() {
    return {
      addDescriptionImport:
        () =>
        ({ chain, tr }) => {
          // prevent adding descriptionImport inside another descriptionImport
          if (tr.selection.$head.depth > 1) return chain().focus().run()
          console.log('addDescriptionImport')

          return chain()
            .deleteSelection()
            .insertContent('<descriptionImport count="0"><div></div></descriptionImport>')
            .focus()
            .run()
        },
    }
  },
})
