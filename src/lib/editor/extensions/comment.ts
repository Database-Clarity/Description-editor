import { Mark, mergeAttributes } from '@tiptap/core'

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    comment: {
      /**
       * Set text color
       */
      toggleComment: () => ReturnType
    }
  }
}

export const Comment = Mark.create({
  name: 'comment',

  addOptions() {
    return {
      HTMLAttributes: {
        class: 'text-comment',
      },
    }
  },

  addAttributes() {
    return {
      class: {
        default: this.options.HTMLAttributes.class,
      },
    }
  },

  parseHTML() {
    return [
      {
        tag: 'span',
        getAttrs: (node) => {
          return node.classList.contains('text-comment') ? {} : false
        },
      }
    ]
  },

  renderHTML({ HTMLAttributes }) {
    return ['span', mergeAttributes(this.options.HTMLAttributes, HTMLAttributes), 0]
  },

  addCommands() {
    return {
      toggleComment:
        () =>
        ({ chain }) => {
          return chain().toggleMark(this.name).focus().run()
        },
    }
  },

  addKeyboardShortcuts() {
    return {
      'Mod-/': () => this.editor.commands.toggleComment(),
    }
  },
})
