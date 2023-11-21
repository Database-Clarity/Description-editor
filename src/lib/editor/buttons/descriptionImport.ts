import { Node, mergeAttributes } from '@tiptap/core'
import { SvelteNodeViewRenderer } from 'svelte-tiptap'

import ImportDescriptionComponent from '$lib/components/DescriptionImportComp.svelte'

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    import: {
      /**
       * Toggle a import block
       */
      toggleImport: () => ReturnType
    }
  }
}

export const DescriptionImport = Node.create({
  name: 'importDescription',
  group: 'block',
  content: 'inline*',
  atom: true,
  draggable: true, // Optional: to make the node draggable
  inline: false,

  addAttributes() {
    return {
      hash: {
        default: 0,
      },
    }
  },

  parseHTML() {
    return [{ tag: 'import-description-component' }]
  },

  renderHTML({ HTMLAttributes }) {
    return ['import-description-component', mergeAttributes(HTMLAttributes)]
  },

  addCommands() {
    return {
      toggleImport:
        () =>
        ({ chain }) => {
          return chain().toggleNode(this.name, 'div').focus().run()
        },
    }
  },

  addNodeView() {
    return SvelteNodeViewRenderer(ImportDescriptionComponent)
  },
})
