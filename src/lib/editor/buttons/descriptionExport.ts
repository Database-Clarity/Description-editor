import { Node, mergeAttributes } from '@tiptap/core'
import { SvelteNodeViewRenderer } from 'svelte-tiptap'

import ExportDescriptionComponent from '$lib/components/DescriptionIExportComp.svelte'

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    export: {
      /**
       * Toggle a import block
       */
      toggleExport: () => ReturnType
    }
  }
}

export const DescriptionExport = Node.create({
  name: 'exportDescription',
  group: 'block',
  content: 'block+',
  draggable: true,
  selectable: true,

  addAttributes() {
    return {
      exportName: '',
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
      toggleExport:
        () =>
        ({ chain }) => {
          return chain().toggleWrap(this.name).focus().run()
        },
    }
  },

  addNodeView() {
    return SvelteNodeViewRenderer(ExportDescriptionComponent)
  },
})
