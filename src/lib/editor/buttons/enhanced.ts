import { Mark, mergeAttributes } from '@tiptap/core'

export const textColors = ['default', 'blue', 'green', 'yellow', 'purple', 'pvp', 'pve'] as const
export type TextColors = (typeof textColors)[number]

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
      toggleEnhanced:
        () =>
        ({ chain }) => {
          return chain().focus().toggleMark(this.name, { class: 'text-enhanced' }).run()
        },
    }
  },
})
