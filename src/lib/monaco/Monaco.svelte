<script lang="ts">
import { onDestroy, onMount } from 'svelte'
import type * as Monaco from 'monaco-editor'
import { type MarkerSeverity } from 'monaco-editor-core'
import { tokensProvider } from './tokensProvider'

let monaco = $state<typeof Monaco>()

let editorElement = $state<HTMLDivElement>()
let editor = $state<Monaco.editor.IStandaloneCodeEditor>()
// let model = $state<monaco.editor.ITextModel>()

onMount(async () => {
  monaco = await import('monaco-editor')
  if (monaco === undefined) return

  monaco.languages.register({ id: 'Clarity-Language' })
  monaco.languages.setMonarchTokensProvider('Clarity-Language', tokensProvider)

  monaco.languages.registerCompletionItemProvider('Clarity-Language', {
    // This is the main function that returns the list of suggestions
    provideCompletionItems: (model, position, context, token) => {
      // The range is essential: it tells Monaco which word segment to replace
      // We'll calculate a default range based on the current word
      const word = model.getWordUntilPosition(position)
      const range = {
        startLineNumber: position.lineNumber,
        endLineNumber: position.lineNumber,
        startColumn: word.startColumn,
        endColumn: word.endColumn,
      }
      const lines = model.getLinesContent()

      for (let i = position.lineNumber - 1; i >= 0; i--) {
        const element = lines[i]

        console.log(element)
      }

      console.time('test')

      console.timeEnd('test')

      // console.log(zzz)

      // You'll insert the logic here
      const suggestions = [
        {
          label: 'Insert link',
          kind: monaco!.languages.CompletionItemKind.Reference,
          documentation: 'Insert link',
          insertText: '[${1:text}](${2:URL})',
          insertTextRules: monaco!.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          range: range, // Use the range calculated above
        },

        // // 2. A Function Suggestion (Snippet)
        // {
        //   label: 'contract-call?',
        //   kind: monaco!.languages.CompletionItemKind.Function,
        //   documentation: 'Executes a public function on another contract.',
        //   insertText: 'contract-call? ${1:contract-id} ${2:function-name} (${3:arguments})',
        //   insertTextRules: monaco!.languages.CompletionItemInsertTextRule.InsertAsSnippet,
        //   range: range,
        // },

        // // 3. A Simple Variable/Constant Suggestion
        // {
        //   label: 'my-variable',
        //   kind: monaco!.languages.CompletionItemKind.Variable,
        //   insertText: 'my-variable',
        //   insertTextRules: monaco!.languages.CompletionItemInsertTextRule.InsertAsSnippet,
        //   range: range,
        // },
      ]

      // console.log(model, position, context, token)

      return { suggestions: suggestions }
    },

    // Optional: Defines characters that automatically trigger the suggestions
    triggerCharacters: ['(', '.', ':'],
  })

  monaco.languages.setLanguageConfiguration('Clarity-Language', {
    comments: {
      lineComment: '//',
      blockComment: ['/*', '*/'],
    },
    brackets: [
      ['[', ']'],
      ['(', ')'],
      ['{', '}'],
      ['<', '/>'],
    ],
    colorizedBracketPairs: [
      // ['(', ')'],
      // ['[', ']'],
      // ['<pvp', '>'],
      // ['<pve', '>'],
      // ['<bold', '>'],
      // ['<yellow', '>'],
      // ['<green', '>'],
    ],

    autoClosingPairs: [
      { open: '{', close: '}' },
      { open: '[', close: ']' },
      { open: '(', close: ')' },
      { open: '"', close: '"' },
    ],
    // surroundingPairs: [
    //   {
    //     open: '(',
    //     close: ')',
    //   },
    // ],
  })

  monaco.languages.registerHoverProvider('Clarity-Language', {
    provideHover: function (model, position) {
      const word = model.getWordAtPosition(position)
      if (word === null) return null

      const lineContent = model.getLineContent(position.lineNumber)

      // Match "import from <digits>"
      const match = /^(import )(\d+ *)/.exec(lineContent)
      if (!match) return null

      if (word.word === 'import') {
        return {
          range: new monaco.Range(position.lineNumber, word.startColumn, position.lineNumber, word.endColumn),
          contents: [
            { value: 'Loads description from a perk with specified hash' },
            { value: 'Hover over hash to see imported description (maybe if I manage to add that :D )' },
            { value: '```Clarity-Language\nimport 123456789\n```' },
          ],
        }
      }

      return null
    },
  })

  monaco.editor.defineTheme('Clarity-Dark', {
    base: 'vs-dark',
    inherit: true,
    rules: [
      // string and string.anything won't have colorized bracket pairs
      { token: 'string', foreground: '#e7a704' }, // orange e7a704 // white d4d4d4
      { token: 'string.link', foreground: '#9cdcfe' },

      // comment and comment.anything won't have colorized bracket pairs
      { token: 'comment', foreground: '#6a9955' },

      { token: 'purple', foreground: '#c586c0' },
      { token: 'blue', foreground: '#54a0ff' },
      { token: 'green', foreground: '#1dd1a1' },

      { token: 'lightBlue', foreground: '#9cdcfe' },
      { token: 'invalid', foreground: '#FF0000' },
      { token: 'gold', foreground: '#D7BA7D' },

      // images \/ img.text has no spacial meaning
      { token: 'img.arch', foreground: '#7cedf3' },
      { token: 'img.solar', foreground: '#f16e27' },
      { token: 'img.void', foreground: '#b384cd' },
      { token: 'img.stasis', foreground: '#4d88ff' },
      { token: 'img.strand', foreground: '#35e366' },

      { token: 'img.special', foreground: '#7bf48b' },
      { token: 'img.heavy', foreground: '#b185ff' },

      { token: 'img.hunter', foreground: '#307fc5' },
      { token: 'img.titan', foreground: '#ee423f' },
      { token: 'img.warlock', foreground: '#e7a704' },

      { token: 'img.enhanced', foreground: '#f3ce53' },
    ],
    colors: {
      'editorBracketHighlight.foreground1': '#c586c0', // purple
      'editorBracketHighlight.foreground2': '#54a0ff', // blue
      'editorBracketHighlight.foreground3': '#1dd1a1', // green
    },
  })

  const text = `var something = test something

<link text [url]/>

enhanced
asd
{
  test
}
    tooltip 234 (
        asd
        [test 󒰀 123](https://localhost:5173) asd [test123](https:///*localh*/ost:5173#sdfsdfsdf)
        asd
    )
)`

  editor = monaco.editor.create(editorElement!, {
    fontFamily: 'Consolas, "Courier New", monospace, D2 Clarity fonts',
    automaticLayout: true,
    theme: 'Clarity-Dark',
    lineNumbersMinChars: 3,
    minimap: { enabled: false },
    language: 'Clarity-Language',
    'semanticHighlighting.enabled': true,
    value: text,
    quickSuggestions: {
      other: true,
      comments: false,
      strings: true,
    },
    // formatOnPaste: true,
  })

  function validate(model) {
    const text = model.getValue()
    const markers: {
      severity: MarkerSeverity
      message: string
      startLineNumber: any
      startColumn: any
      endLineNumber: any
      endColumn: any
    }[] = []

    // Simple check: opener without closer
    const importOpen = /tooltip [A-z0-9 ]+? \(/.exec(text)
    const hasCloser = /\)/.test(text)

    if (importOpen && !hasCloser) {
      markers.push({
        severity: monaco!.MarkerSeverity.Error,
        message: "Missing closing ')'",
        startLineNumber: model.getPositionAt(importOpen.index).lineNumber,
        startColumn: model.getPositionAt(importOpen.index).column,
        endLineNumber: model.getPositionAt(importOpen.index + importOpen[0].length).lineNumber,
        endColumn: model.getPositionAt(importOpen.index + importOpen[0].length).column,
      })
    }

    monaco?.editor.setModelMarkers(model, 'owner', markers)
  }

  // Validate once at start
  // validate(editor?.getModel())

  // Re-run validation whenever text changes
  editor?.onDidChangeModelContent(() => {
    validate(editor?.getModel())
  })
})

onDestroy(() => {
  monaco?.editor.getModels().forEach((model) => model.dispose())
  editor?.dispose()
})
</script>

<div class="editor" bind:this={editorElement}></div>

<style>
.editor {
  height: 80vh;
}
</style>
