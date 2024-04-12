import { Mark } from '@tiptap/core'

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    bold: {
      /**
       * Toggle a bold mark
       */
      toggleBold: () => ReturnType
    }
  }
}

export const Bold = Mark.create({
  name: 'bold',

  parseHTML() {
    return [{ tag: 'b' }]
  },

  renderHTML() {
    return ['b', 0]
  },

  addCommands() {
    return {
      toggleBold:
        () =>
        ({ chain }) => {
          return chain().toggleMark(this.name).focus().run()
        },
    }
  },

  addKeyboardShortcuts() {
    return {
      'Mod-b': () => this.editor.commands.toggleBold(),
      'Mod-B': () => this.editor.commands.toggleBold(),
    }
  },
})
