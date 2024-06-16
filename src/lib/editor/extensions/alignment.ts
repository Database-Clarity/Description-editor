import { Extension } from '@tiptap/core'

export const alignments = ['left', 'center', 'right'] as const
export type Alignments = (typeof alignments)[number]

type TextAlignOptions = {
  types: string[]
  alignments: Alignments[]
  defaultAlignment: Alignments
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    textAlign: {
      /**
       * Set the text align class
       */
      setTextAlign: (alignment: Alignments) => ReturnType
    }
  }
}

export const TextAlign = Extension.create<TextAlignOptions>({
  name: 'textAlign',

  addOptions() {
    return {
      types: ['div'],
      alignments: [...alignments],
      defaultAlignment: 'left',
    }
  },

  addGlobalAttributes() {
    return [
      {
        types: this.options.types,
        attributes: {
          class: {
            default: this.options.defaultAlignment,
            parseHTML: (element) => {
              // code in parseHTML => filters out the class names that are not in the alignments array
              const className = element.getAttribute('class')
              const regex = new RegExp(alignments.join('|'))
              const match = className?.match(regex)

              if (match) {
                return match[0]
              }
              // return false
            },
            renderHTML: (attributes) => {
              if (attributes.class === this.options.defaultAlignment) {
                return {}
              }

              return {
                class: attributes.class,
              }
            },
          },
        },
      },
    ]
  },

  addCommands() {
    return {
      setTextAlign:
        (alignment: Alignments) =>
        ({ chain }) => {
          return this.options.types.every((type) => {
            return chain().updateAttributes(type, { class: alignment }).focus().run()
          })
        },
    }
  },
})
