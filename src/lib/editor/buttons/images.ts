import { Mark, mergeAttributes } from '@tiptap/core'

export const images = {
  // elements
  arc: { img: '󒰀', class: 'img-arc' },
  solar: { img: '󒰁', class: 'img-solar' },
  void: { img: '󒰂', class: 'img-void' },
  stasis: { img: '󒰃', class: 'img-stasis' },
  strand: { img: '󒰄', class: 'img-strand' },
  // breakers
  barrier: { img: '󒰐', class: 'img-barrier' },
  overload: { img: '󒰑', class: 'img-overload' },
  unstoppable: { img: '󒰒', class: 'img-unstoppable' },
  // ammo
  primary: { img: '󒰠', class: 'img-primary' },
  special: { img: '󒰡', class: 'img-special' },
  heavy: { img: '󒰢', class: 'img-heavy' },
  // classes
  warlock: { img: '󒰰', class: 'img-warlock' },
  hunter: { img: '󒰱', class: 'img-hunter' },
  titan: { img: '󒰲', class: 'img-titan' },

  arrow: { img: '󒱀', class: 'img-arrow' },
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
  excludes: '_',

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
    return [{ tag: 'span' }]
  },

  renderHTML({ HTMLAttributes }) {
    return ['span', mergeAttributes(this.options.HTMLAttributes, HTMLAttributes)]
  },

  addCommands() {
    return {
      setImage:
        (name) =>
        ({ chain }) => {
          return chain().setMark(this.name, { class: images[name].class }).insertContent(images[name].img).focus().run()
        },
    }
  },
})
