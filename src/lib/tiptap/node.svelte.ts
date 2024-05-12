import { NodeView, Editor, type DecorationWithType } from '@tiptap/core'
import type { NodeViewRenderer, NodeViewProps, NodeViewRendererOptions } from '@tiptap/core'
import type { Decoration } from '@tiptap/pm/view'
import type { Node as ProseMirrorNode } from '@tiptap/pm/model'
import { mount, type ComponentType, type SvelteComponent } from 'svelte'

import SvelteRenderer from './SvelteRenderer'
import { writable, type Writable } from 'svelte/store'

interface RendererUpdateProps {
  oldNode: ProseMirrorNode
  oldDecorations: Decoration[]
  newNode: ProseMirrorNode
  newDecorations: Decoration[]
  updateProps: () => void
}

export interface SvelteNodeViewRendererOptions extends NodeViewRendererOptions {
  update: ((props: RendererUpdateProps) => boolean) | null
  as?: string
}

export type Props = {
  editor: Editor
  node: ProseMirrorNode
  decorations: Decoration[]
  selected: boolean
  extension: any
  getPos: () => number
  deleteNode: () => void
  attrs: Writable<any>
}

type SvelteComponentRaw = ComponentType<SvelteComponent<Partial<Props>>>

class SvelteNodeView extends NodeView<SvelteComponentRaw, Editor, SvelteNodeViewRendererOptions> {
  declare renderer: SvelteRenderer

  declare contentDOMElement: HTMLElement | null

  override mount(): void {
    const Component = this.component

    const attrsStore = writable({ ...this.node.attrs })

    attrsStore.subscribe((attrs) => {
      this.updateAttributes(attrs)
    })

    const props: Props = $state({
      editor: this.editor,
      node: this.node,
      decorations: this.decorations,
      selected: false,
      extension: this.extension,
      getPos: () => this.getPos(),
      // updateAttributes: (attributes = {}) => this.updateAttributes(attrsStore),
      deleteNode: () => this.deleteNode(),

      // --- Custom ---
      attrs: attrsStore,
    })

    this.contentDOMElement = this.node.isLeaf ? null : document.createElement(this.node.isInline ? 'span' : 'div')

    if (this.contentDOMElement) {
      // For some reason the whiteSpace prop is not inherited properly in Chrome and Safari
      // With this fix it seems to work fine
      // See: https://github.com/ueberdosis/tiptap/issues/1197
      this.contentDOMElement.style.whiteSpace = 'inherit'
    }

    const as = this.options.as ?? (this.node.isInline ? 'span' : 'div')
    const target = document.createElement(as)
    target.classList.add(`node-${this.node.type.name}`)

    this.handleSelectionUpdate = this.handleSelectionUpdate.bind(this)
    this.editor.on('selectionUpdate', this.handleSelectionUpdate)

    const context = new Map()
    context.set('STT_DragEvent', {
      onDragStart: this.onDragStart.bind(this),
    })

    const svelteComponent = mount(Component, {
      target,
      props,
      context,
    })

    this.renderer = new SvelteRenderer(svelteComponent, {
      element: target,
      props,
    })

    this.appendContendDom()
  }

  private appendContendDom() {
    const contentElement = this.dom.querySelector('[data-node-view-content]')

    if (this.contentDOMElement && contentElement && !contentElement.contains(this.contentDOMElement)) {
      contentElement.appendChild(this.contentDOMElement)
    }
  }

  override get dom() {
    if (!this.renderer.dom.firstElementChild?.hasAttribute('data-node-view-wrapper')) {
      throw Error('Please use the NodeViewWrapper component for your node view.')
    }

    return this.renderer.dom
  }

  override get contentDOM() {
    if (this.node.isLeaf) {
      return null
    }

    return this.contentDOMElement
  }

  handleSelectionUpdate() {
    const { from, to } = this.editor.state.selection

    if (from <= this.getPos() && to >= this.getPos() + this.node.nodeSize) {
      this.selectNode()
    } else {
      this.deselectNode()
    }
  }

  update(node: ProseMirrorNode, decorations: DecorationWithType[]): boolean {
    const updateProps = () => {
      this.renderer.updateProps({ node, decorations })
    }

    if (typeof this.options.update === 'function') {
      const oldNode = this.node
      const oldDecorations = this.decorations

      this.node = node
      this.decorations = decorations

      return this.options.update({
        oldNode,
        oldDecorations,
        newNode: node,
        newDecorations: decorations,
        updateProps: () => updateProps(),
      })
    }

    if (node.type !== this.node.type) {
      return false
    }

    if (node === this.node && this.decorations === decorations) {
      return true
    }

    this.node = node
    this.decorations = decorations
    updateProps()

    return true
  }

  selectNode(): void {
    this.renderer.updateProps({ selected: true })
  }

  deselectNode(): void {
    this.renderer.updateProps({ selected: false })
  }

  destroy(): void {
    this.renderer.destroy()
    this.editor.off('selectionUpdate', this.handleSelectionUpdate)
    this.contentDOMElement = null
  }
}

const SvelteNodeViewRenderer = (
  component: SvelteComponentRaw,
  options?: Partial<SvelteNodeViewRendererOptions>
): NodeViewRenderer => {
  return (props): SvelteNodeView => new SvelteNodeView(component, props, options)
}

export default SvelteNodeViewRenderer
