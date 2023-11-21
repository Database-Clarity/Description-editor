import { Node, mergeAttributes } from '@tiptap/core'
import { SvelteNodeViewRenderer } from 'svelte-tiptap'

import ExportDescriptionComponent from '$lib/components/DescriptionIExportComp.svelte'

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    export: {
      /**
       * Toggle a import block
       */
      addExport: () => ReturnType
    }
  }
}

export const DescriptionExport = Node.create({
  name: 'exportDescription',
  group: 'block',
  content: 'block+',
  draggable: true,

  addAttributes() {
    return {
      hash: {
        default: 0,
      },
    }
  },

  parseHTML() {
    return [{ tag: 'export-description-component' }]
  },

  renderHTML({ HTMLAttributes }) {
    return ['export-description-component', mergeAttributes(HTMLAttributes), 0]
  },

  addCommands() {
    return {
      addExport:
        () =>
        ({ chain }) => {
          return chain()
            .focus()
            .insertContent(`<export-description-component><div></div></export-description-component>`)
            .run()
        },
    }
  },

  addNodeView() {
    return SvelteNodeViewRenderer(ExportDescriptionComponent)
  },
})
