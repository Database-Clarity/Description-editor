import { Node, mergeAttributes } from '@tiptap/core'

interface BulletListOptions {
  itemTypeName: string
  HTMLAttributes: Record<string, unknown>
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    bulletList: {
      /**
       * Toggle a bullet list
       */
      toggleBulletList: () => ReturnType
    }
  }
}

export const BulletList = Node.create<BulletListOptions>({
  name: 'bulletList',

  addOptions() {
    return {
      itemTypeName: 'listItem',
      HTMLAttributes: {},
    }
  },

  group: 'block list',

  content() {
    return `${this.options.itemTypeName}+`
  },

  parseHTML() {
    return [{ tag: 'ul' }]
  },

  renderHTML({ HTMLAttributes }) {
    return ['ul', mergeAttributes(this.options.HTMLAttributes, HTMLAttributes), 0]
  },

  addCommands() {
    return {
      toggleBulletList:
        () =>
        ({ chain }) => {
          return chain().toggleList(this.name, this.options.itemTypeName).focus().run()
        },
    }
  },

  addKeyboardShortcuts() {
    return {
      // prettier-ignore
      'Tab': () => this.editor.commands.toggleBulletList(),
    }
  },
})

interface ListItemOptions {
  HTMLAttributes: Record<string, unknown>
  bulletListTypeName: string
}

export const ListItem = Node.create<ListItemOptions>({
  name: 'listItem',

  addOptions() {
    return {
      HTMLAttributes: {},
      bulletListTypeName: 'bulletList',
    }
  },

  content: 'div block*',

  defining: true,

  parseHTML() {
    return [
      {
        tag: 'li',
      },
    ]
  },

  renderHTML({ HTMLAttributes }) {
    return ['li', mergeAttributes(this.options.HTMLAttributes, HTMLAttributes), 0]
  },

  addKeyboardShortcuts() {
    return {
      Enter: () => this.editor.commands.splitListItem(this.name),
    }
  },
})
