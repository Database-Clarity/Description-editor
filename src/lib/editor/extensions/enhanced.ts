import { Mark, mergeAttributes } from '@tiptap/core'

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    enhanced: {
      /**
       * Toggle enhanced
       */
      toggleEnhanced: () => ReturnType
    }
  }
}

export const Enhanced = Mark.create({
  name: 'enhanced',
  priority: 101,

  inclusive: false,

  addOptions() {
    return {
      HTMLAttributes: {
        class: 'enhanced',
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
          if (node.classList.contains('enhanced')) return { class: 'enhanced' }
          return false
        },
      },
    ]
  },

  renderHTML({ HTMLAttributes }) {
    return ['span', mergeAttributes(this.options.HTMLAttributes, HTMLAttributes), 0]
  },

  addCommands() {
    return {
      toggleEnhanced:
        () =>
        ({ chain }) => {
          return chain().focus().toggleMark(this.name).run()
        },
    }
  },
})
