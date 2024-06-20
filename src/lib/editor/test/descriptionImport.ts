import { Node, mergeAttributes } from '@tiptap/core'
import type { PendingQuery } from '$lib/types'
import DescriptionImport from './DescriptionImport.svelte'
import SvelteNodeViewRenderer from '$lib/tiptap/node.svelte'
import { writable } from 'svelte/store'
import type { Perk } from '$lib/server/queries'

/**
 * It is used for one edge case and that is only place it should be used.
 */
export const descriptionImportStore = writable<PendingQuery<Perk[]>>()

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    descriptionImport: {
      /**
       * insert a counter component
       */
      addDescriptionImport: () => ReturnType
    }
  }
}

export const DescriptionImportExtension = Node.create({
  name: 'descriptionImport',
  group: 'block',
  content: 'div*', // seems like best option it won't let anything to be dragged in to it
  draggable: true, // Optional: to make the node draggable
  selectable: false, // Optional: to make the node selectable

  // atom: true, // king of prevents editing but bugged

  addAttributes() {
    return {
      hash: {
        default: 0,
      },
    }
  },

  parseHTML() {
    return [{ tag: this.name }]
  },

  renderHTML({ HTMLAttributes }) {
    return [this.name, mergeAttributes(HTMLAttributes), 0]
  },

  addNodeView() {
    return SvelteNodeViewRenderer(DescriptionImport)
    // return () => {
    //   const container = document.createElement(this.name)

    //   const svelteComponent = mount(Component, {
    //     target: container,
    //   })

    //   const content = document.createElement('div')
    //   // content.contentEditable = 'false'
    //   container.append(content)

    //   content.addEventListener('keypress', (event) => {
    //     console.log('keydown', event)
    //   })

    //   return {
    //     destroy() {
    //       unmount(svelteComponent)
    //     },
    //     dom: container,
    //     contentDOM: content,
    //     update(node) {
    //       console.log('update', node)
    //     },
    //     // stopEvent(event) {
    //     //   console.log(event)
    //     // },
    //     // ignoreMutation(mutation) {
    //     //   console.log(mutation)
    //     //   return false
    //     // },
    //     // setSelection(anchor, head, root) {
    //     //   console.log(anchor, head, root)
    //     // },
    //   }
    // }
  },

  addCommands() {
    return {
      addDescriptionImport:
        () =>
        ({ chain, tr }) => {
          // prevent adding descriptionImport inside another descriptionImport
          if (tr.selection.$head.depth > 1) return chain().focus().run()

          return (
            chain()
              .deleteSelection()
              .insertContent('<descriptionImport hash="0"><div></div></descriptionImport>')
              // .setNode(this.name, { hash: 0 }) // this would be preferable but it doesn't work
              .focus()
              .run()
          )
        },
    }
  },

  // addKeyboardShortcuts() {
  //   this.editor.state.doc.type.name
  //   console.log(123)

  //   return {
  //     'shift-2': () => {
  //       console.log('shift-2')

  //       return this.editor.commands.toggleMark(this.name)
  //     },
  //   }
  // },
  // TODO: add a way to add div above or below
})
