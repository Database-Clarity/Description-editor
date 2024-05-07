import type { BubbleMenuPluginProps } from '@tiptap/extension-bubble-menu'
import type { EditorOptions } from '@tiptap/core'
// import type { FloatingMenuPluginProps } from '@tiptap/extension-floating-menu'

export type EditorSettings = Partial<Omit<EditorOptions, 'element' | 'onTransaction' | 'extensions'>> & {
  extensions: EditorOptions['extensions']
}
export type BubbleMenuSettings = Partial<Omit<BubbleMenuPluginProps, 'element' | 'editor'>>
// export type FloatingMenuSettings = Partial<Omit<FloatingMenuPluginProps, 'element' | 'editor'>>

export interface TiptapNodeViewContext {
  onDragStart: (event: DragEvent) => void
}
