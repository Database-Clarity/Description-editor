import { Mark, getAttributes, mergeAttributes } from '@tiptap/core'
import { Plugin, PluginKey } from '@tiptap/pm/state'

export interface LinkOptions {
  /**
   * A list of HTML attributes to be rendered.
   */
  HTMLAttributes: Record<string, unknown>
  /**
   * A validation function that modifies link verification for the auto linker.
   * @param url - The url to be validated.
   * @returns - True if the url is valid, false otherwise.
   */
  // validate?: (url: string) => boolean
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    link: {
      /**
       * Set a link mark
       */
      setLink: (attributes: { href: string; target?: string | null; class?: string | null }) => ReturnType
      /**
       * Toggle a link mark
       */
      toggleLink: (attributes: { href: string; target?: string | null; class?: string | null }) => ReturnType
      /**
       * Unset a link mark
       */
      unsetLink: () => ReturnType
    }
  }
}

export const Link = Mark.create<LinkOptions>({
  name: 'link',

  priority: 1000,

  keepOnSplit: false,

  // then typing at the end of a mark, should new text be inside of the mark?
  inclusive: false, // false means no

  addOptions() {
    return {
      HTMLAttributes: {
        target: '_blank',
        class: 'underline',
      },
    }
  },

  addAttributes() {
    return {
      href: {
        default: null,
      },
      target: {
        default: this.options.HTMLAttributes.target,
      },
      class: {
        default: this.options.HTMLAttributes.class,
      },
    }
  },

  parseHTML() {
    return [{ tag: 'a' }]
  },

  renderHTML({ HTMLAttributes }) {
    return ['a', mergeAttributes(this.options.HTMLAttributes, HTMLAttributes), 0]
  },

  addCommands() {
    return {
      setLink:
        (attributes) =>
        ({ chain }) => {
          return chain().setMark(this.name, attributes).run()
        },

      toggleLink:
        (attributes) =>
        ({ chain }) => {
          return chain().toggleMark(this.name, attributes, { extendEmptyMarkRange: true }).run()
        },

      unsetLink:
        () =>
        ({ chain }) => {
          return chain().unsetMark(this.name, { extendEmptyMarkRange: true }).run()
        },
    }
  },

  addProseMirrorPlugins() {
    const plugins: Plugin[] = [
      new Plugin({
        key: new PluginKey('handleClickLink'),
        props: {
          handleClick: (view, pos, event) => {
            if (event.button !== 0) return false // only handle left clicks
            if ((event.target as HTMLElement).nodeName !== 'A') return false // only handle clicks on links

            const markType = this.type

            const attrs = getAttributes(view.state, markType.name)
            const link = event.target as HTMLLinkElement

            const href = link?.href ?? attrs.href
            const target = link?.target ?? attrs.target

            if (!href || !target) return false // only handle links with href and target

            if (view.editable) {
              // const { state, dispatch } = view
              // const { schema, doc, tr } = state
              // const range = getMarkRange(doc.resolve(pos), schema.marks.link) // get the range of the link
              // if (!range) return
              // const { from, to } = range
              // const newMark = markType.create({ href: 'notgoodle.com', target })
              // tr.removeMark(from, to, markType)
              // tr.addMark(from, to, newMark)
              // dispatch(tr)
            } else {
              window.open(href, target) // if editable is false, open link
            }
            return true
          },
        },
      }),
    ]

    return plugins
  },
})
