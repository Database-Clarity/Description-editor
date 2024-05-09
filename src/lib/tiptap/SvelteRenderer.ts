import type { NodeViewProps } from '@tiptap/core'
import type { Props } from '$lib/tiptap/node.svelte'
import { unmount } from 'svelte'

interface RendererOptions {
  element: HTMLElement
  props: Props
}

class SvelteRenderer {
  component: Record<string, any>
  props: Props

  dom: HTMLElement

  constructor(component: Record<string, any>, { element, props }: RendererOptions) {
    this.component = component
    this.dom = element
    this.props = props

    this.dom.classList.add('svelte-renderer')
  }

  updateProps(props: Partial<NodeViewProps>): void {
    for (const key in props) {
      // @ts-ignore
      this.props[key] = props[key]
    }
  }

  destroy(): void {
    unmount(this.component)
  }
}

export default SvelteRenderer
