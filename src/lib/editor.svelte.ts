import type * as monaco from 'monaco-editor-core'
import { onMount, untrack } from 'svelte'

export type MonacoEditor = monaco.editor.IStandaloneCodeEditor
export type MonacoModel = monaco.editor.ITextModel
export type MonacoDiffEditor = monaco.editor.IDiffEditor
export type MonacoDiffModel = monaco.editor.IDiffEditorModel

export class Editor {
  monaco = $state<typeof monaco>()
  editor = $state<MonacoEditor>()

  /**
   * Creates a new editor instance
   * @param container The HTML element to render the editor in
   */
  constructor(container: HTMLDivElement) {
    onMount(async () => {
      this.monaco = await import('monaco-editor-core')
      this.editor = this.monaco.editor.create(container, {
        theme: 'vs-dark',
      })
    })

  }
}
untrack(() => {
  monaco?.editor.getModels().forEach((model) => model.dispose())
  editor?.dispose()
})


