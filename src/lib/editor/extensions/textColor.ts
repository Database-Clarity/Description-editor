import { Mark, mergeAttributes } from '@tiptap/core'

export const textColors = ['default', 'blue', 'green', 'yellow', 'purple', 'pvp', 'pve'] as const
export type TextColors = (typeof textColors)[number]

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    textColor: {
      /**
       * Set text color
       */
      setTextColor: (className: TextColors) => ReturnType
      /**
       * Remove text color
       */
      removeTextColor: () => ReturnType
    }
  }
}

export const TextColor = Mark.create({
  name: 'textColor',

  addOptions() {
    return {
      HTMLAttributes: {
        class: null,
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
    return [{ tag: 'span' }]
  },

  renderHTML({ HTMLAttributes }) {
    return ['span', mergeAttributes(this.options.HTMLAttributes, HTMLAttributes), 0]
  },

  addCommands() {
    return {
      setTextColor:
        (className) =>
        ({ chain }) => {
          return chain().focus().setMark(this.name, { class: className }).run()
        },
      removeTextColor:
        () =>
        ({ chain }) => {
          return chain().focus().unsetMark(this.name).run()
        },
    }
  },
})
