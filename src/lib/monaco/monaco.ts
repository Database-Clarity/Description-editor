import { onDestroy, onMount } from 'svelte'
import type * as Monaco from 'monaco-editor'

export async function startMonacoEditor() {
  let monaco = $state<typeof Monaco>()

  let editorElement = $state<HTMLDivElement>()
  let editor = $state<Monaco.editor.IStandaloneCodeEditor>()

  onMount(async () => {
    monaco = await import('monaco-editor')

    editor = monaco.editor.create(editorElement!, {
      automaticLayout: true,
      theme: 'vs-dark',
      lineNumbersMinChars: 10
    })
  })

  onDestroy(() => {
    monaco?.editor.getModels().forEach((model) => model.dispose())
    editor?.dispose()
  })
}