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
  content: 'div*', // seems like best option it won't let anything to be dragged in to it
  draggable: true, // Optional: to make the node draggable
  selectable: true, // Optional: to make the node selectable

  // atom: true, // king of prevents editing but bugged

  addAttributes() {
    return {
      hash: {
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

          return (
            chain()
              .deleteSelection()
              .insertContent('<descriptionImport hash="0"><div></div></descriptionImport><div></div>')
              // .setNode(this.name, { hash: 0 }) // this would be preferable but it doesn't work
              .focus()
              .run()
          )
        },
    }
  },
  // TODO: add a way to add div above or below
})
