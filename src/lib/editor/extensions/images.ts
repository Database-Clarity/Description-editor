import { Mark, mergeAttributes } from '@tiptap/core'

export const images = {
  // elements
  arc: { img: '󒰀', class: 'arc' },
  solar: { img: '󒰁', class: 'solar' },
  void: { img: '󒰂', class: 'void' },
  stasis: { img: '󒰃', class: 'stasis' },
  strand: { img: '󒰄', class: 'strand' },
  // breakers
  barrier: { img: '󒰐', class: 'barrier' },
  overload: { img: '󒰑', class: 'overload' },
  unstoppable: { img: '󒰒', class: 'unstoppable' },
  // ammo
  primary: { img: '󒰠', class: 'primary' },
  special: { img: '󒰡', class: 'special' },
  heavy: { img: '󒰢', class: 'heavy' },
  // classes
  warlock: { img: '󒰰', class: 'warlock' },
  hunter: { img: '󒰱', class: 'hunter' },
  titan: { img: '󒰲', class: 'titan' },

  arrow: { img: '󒱀', class: 'arrow' },
}
export const imageNames = Object.keys(images) as (keyof typeof images)[]
export type ImageNames = keyof typeof images

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    image: {
      /**
       * Add element, breaker, ammo, or class font image to editor
       */
      setImage: (name: ImageNames) => ReturnType
    }
  }
}

export const Images = Mark.create({
  name: 'image',

  // can't be inside any other mark
  excludes: 'bold textColor',

  // then typing at the end of a mark, should new text be inside of the mark?
  inclusive: false, // false means no

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
    return [
      {
        tag: 'span',
        getAttrs: (node) => {
          for (const className of node.classList) {
            if (imageNames.includes(className as ImageNames)) return { class: className }
          }
          return false
        },
      },
    ]
  },

  renderHTML({ HTMLAttributes, mark }) {
    return ['span', mergeAttributes(this.options.HTMLAttributes, HTMLAttributes)]
  },

  addCommands() {
    return {
      setImage:
        (name) =>
        ({ chain }) => {
          return chain()
            .deleteSelection()
            .setMark(this.name, { class: images[name].class })
            .insertContent(images[name].img)
            .focus()
            .run()
        },
    }
  },

  // addPasteRules() {
  //   const regex = /<void\/>/
  //   return [
  //     markPasteRule({
  //       find: regex,
  //       type: this.editor.schema.marks.image,

  //     }),
  //   ]
  // },

  // addKeyboardShortcuts() {
  //   return {
  //     'shift-2': () => {
  //       console.log('shift-2')

  //       return this.editor.commands.toggleMark(this.name)
  //     },
  //   }
  // },
})
