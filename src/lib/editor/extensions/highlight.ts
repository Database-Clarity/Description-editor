import { Mark, mergeAttributes } from '@tiptap/core'

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    highlight: {
      /**
       * Toggle a highlight mark
       */
      toggleHighlight: () => ReturnType
    }
  }
}

export const Highlight = Mark.create({
  name: 'highlight',

  addOptions() {
    return {
      HTMLAttributes: {
        class: 'highlight ',
      },
    }
  },

  parseHTML() {
    return [
      {
        tag: 'span',
        getAttrs: (node) => {
          for (const className of node.classList) {
            if (className === 'highlight') return { class: className }
          }
          return false
        },
      },
    ]
  },

  renderHTML({ HTMLAttributes, mark }) {
    return ['span', mergeAttributes(this.options.HTMLAttributes, HTMLAttributes), 0]
  },

  addCommands() {
    return {
      toggleHighlight:
        () =>
        ({ chain }) => {
          return chain().toggleMark(this.name).focus().run()
        },
    }
  },
})
