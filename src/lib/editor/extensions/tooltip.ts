import { Mark, mergeAttributes } from '@tiptap/core'

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    tooltip: {
      /**
       * Toggle a tooltip mark
       */
      toggleTooltip: () => ReturnType

      /**
       * Update tooltip id
       */
      updateTooltipId: (id: number) => ReturnType
    }
  }
}

export const Tooltip = Mark.create({
  name: 'tooltip',

  addOptions() {
    return {
      HTMLAttributes: {
        name: 'none',
        class: 'tooltip',
      },
    }
  },

  addAttributes() {
    return {
      class: {
        default: this.options.HTMLAttributes.class,
      },
      name: {
        default: this.options.HTMLAttributes.name,
      },
    }
  },

  parseHTML() {
    return [{ tag: 'span' }]
  },

  renderHTML({ HTMLAttributes }) {
    return ['span', mergeAttributes(this.options.HTMLAttributes, HTMLAttributes), 0]
  },

  addCommands() {
    return {
      toggleTooltip:
        () =>
        ({ chain }) => {
          return chain().toggleMark(this.name).focus().run()
        },
      updateTooltipId:
        (name) =>
        ({ chain, view }) => {
          const { state } = view

          return chain()
            .extendMarkRange(this.name, { name: this.options.HTMLAttributes.name })
            .updateAttributes(this.name, { name })
            .setTextSelection(state.selection)
            .focus()
            .run()
        },
    }
  },
})
