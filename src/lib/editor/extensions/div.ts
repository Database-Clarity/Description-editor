import { Node } from '@tiptap/core'

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    div: {
      /**
       * Insert div node
       */
      setDiv: () => ReturnType
    }
  }
}

export const Div = Node.create({
  name: 'div',
  priority: 1000,
  group: 'block',
  content: 'inline*',

  parseHTML() {
    return [{ tag: 'div' }]
  },

  renderHTML({ HTMLAttributes }) {
    return ['div', HTMLAttributes, 0]
  },

  addCommands() {
    return {
      setDiv:
        () =>
        ({ commands }) => {
          return commands.setNode(this.name)
        },
    }
  },
})
