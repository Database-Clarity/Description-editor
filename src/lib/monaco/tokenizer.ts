import * as monaco from 'monaco-editor'

import { createConditionalSuggestions, createNormalSuggestions, createWrapperSuggestions, imports, titleSuggestions, variableSuggestions } from './autoCompletion.js'

// import { selfContainedArr } from 'src/data/randomData'
// import { weaponTypes } from '@icemourne/description-converter'

const specialWrappers = ['green', 'blue', 'purple', 'yellow', 'center', 'bold', 'pve', 'pvp']

export const wrappers = {
  imageAdding: [
    'kinetic',
    'stasis',
    'arc',
    'solar',
    'void',
    'strand',

    'primary',
    'special',
    'heavy',

    'barrier',
    'overload',
    'unstoppable',

    'warlock',
    'hunter',
    'titan'
  ],
  complicated: ['link', 'title', 'formula'],
  lineEffecting: [...specialWrappers, 'breakSpaces', 'background'],
  textEffecting: specialWrappers
}

export const selfContainedArr = [...wrappers.imageAdding, ...wrappers.lineEffecting]

export type ConditionalSuggestions = {
  range: {
    startLineNumber: number
    endLineNumber: number
    startColumn: number
    endColumn: number
  }
  kind: monaco.languages.CompletionItemKind
  insertTextRules: monaco.languages.CompletionItemInsertTextRule
  label: string
  insertText: string
}

export function createEditor() {
  const comments: [RegExp, {}][] = [
    [/ \/\/.*$/, { token: 'darkGreen' }],
    [/^\/\/.*$/, { token: 'darkGreen' }],
    [/\/\*/, { token: 'darkGreen', next: '@comment' }]
  ]

  monaco.languages.register({ id: 'clarityLangue' })

  monaco.editor.defineTheme('myCoolTheme', {
    base: 'vs',
    inherit: false,
    // prettier-ignore
    rules: [
      { token: 'green', foreground: '4ec9b0' }, // class green
      { token: 'blue', foreground: '4fc1ff' }, // const blue
      { token: 'purple', foreground: 'c586c0' }, // export purple
      { token: 'lightBlue', foreground: '9cdcfe' }, // let blue
      { token: 'yellow', foreground: 'dcdcaa' }, // function yellow
      { token: 'darkGreen', foreground: '6a9955' }, // comment green
      { token: 'grey', foreground: '858585' }, // 9d9d9d

    ],
    // prettier-ignore
    colors: {
      'editor.foreground': '#ffffff',   // normal text | white
      'editor.background': '#1e1e1e',   // editor background | dark grey
      'editorLineNumber.foreground': '#858585',   // line number | grey
      'editorLineNumber.activeForeground': '#c6c6c6',   // active line number | light grey
      'editorCursor.foreground': '#ffffff',   // blinking thing | white
      'editor.lineHighlightBorder': '#fff0',     // active line border | transparent
      'editor.selectionBackground': '#004972b8', // selected text background | blue // todo: color needs some work
      'editorSuggestWidget.background': '#252526',   // suggestion background
      'editorSuggestWidget.border': '#454545',   // suggestion border
      'list.hoverBackground': '#2a2d2e',   // dropdown hover over
      'foreground': '#78a8f6',   // image color in dropdown
      // split view
      'diffEditor.removedTextBackground': '#ff000070', // removed text background
      'diffEditor.insertedTextBackground': '#a0bf5652'  // inserted text background
    }
  })

  monaco.languages.registerCompletionItemProvider('clarityLangue', {
    provideCompletionItems: (model, position, context, provider) => {
      const lineContent = model.getLineContent(position.lineNumber)
      const description = model.getLinesContent().join('\n')
      let conditionalSuggestions: monaco.languages.CompletionItem[] = []

      if (lineContent[position.column - 2] === '#') {
        return { suggestions: variableSuggestions(description) }
      }

      if (lineContent[position.column - 2] === '[' && lineContent.match(/<title /)) {
        return { suggestions: titleSuggestions(description) }
      }

      if (lineContent.startsWith('import')) {
        return { suggestions: (conditionalSuggestions = imports(lineContent)) }
      }

      if (lineContent.startsWith('< table ')) {
        return { suggestions: createConditionalSuggestions(lineContent, 'table') }
      }

      if (lineContent.startsWith('< weapon type ( ') || lineContent.startsWith('< ( ')) {
        return { suggestions: createConditionalSuggestions(lineContent, 'weaponType') }
      }

      const suggestions = [
        ...createNormalSuggestions(),
        ...createWrapperSuggestions(),
        {
          label: 'formula_ready',
          insertText: '<formula ${2:Ready Speed:} [ready_${1:0}] />',
          kind: monaco.languages.CompletionItemKind.Class,
          insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet
        } as unknown as ConditionalSuggestions,
        {
          label: 'formula_stow',
          insertText: '<formula ${2:Stow Speed:} [stow_${1:0}] />',
          kind: monaco.languages.CompletionItemKind.Class,
          insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet
        } as unknown as ConditionalSuggestions,
        {
          label: 'formula_range',
          insertText: '<formula ${2:Effective Range:} [range_${1:0}] />',
          kind: monaco.languages.CompletionItemKind.Class,
          insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet
        } as unknown as ConditionalSuggestions,
        {
          label: 'formula_reload',
          insertText: '<formula ${2:Reload Time:} [reload_${1:0}] />',
          kind: monaco.languages.CompletionItemKind.Class,
          insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet
        } as unknown as ConditionalSuggestions,

        {
          label: 'formula_ready_empty',
          insertText: '<formula [ready_${1:0}] />',
          kind: monaco.languages.CompletionItemKind.Class,
          insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet
        } as unknown as ConditionalSuggestions,
        {
          label: 'formula_stow_empty',
          insertText: '<formula [stow_${1:0}] />',
          kind: monaco.languages.CompletionItemKind.Class,
          insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet
        } as unknown as ConditionalSuggestions,
        {
          label: 'formula_range_empty',
          insertText: '<formula [range_${1:0}] />',
          kind: monaco.languages.CompletionItemKind.Class,
          insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet
        } as unknown as ConditionalSuggestions,
        {
          label: 'formula_reload_empty',
          insertText: '<formula [reload_${1:0}] />',
          kind: monaco.languages.CompletionItemKind.Class,
          insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet
        } as unknown as ConditionalSuggestions,

        {
          label: 'link',
          insertText: '<link ${1:Name} [${2:URL}] />',
          kind: monaco.languages.CompletionItemKind.Class,
          insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet
        } as unknown as ConditionalSuggestions,
        {
          label: 'combatant',
          insertText: '<link ${1:Combatant} [https://d2clarity.page.link/combatant] />',
          kind: monaco.languages.CompletionItemKind.Class,
          insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet
        } as unknown as ConditionalSuggestions,

        {
          label: 'math',
          insertText: '${${1:math stuff}}',
          insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet
        } as unknown as ConditionalSuggestions,
        {
          label: 'math with 🡅',
          insertText: '#e${${1:math stuff}}',
          insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet
        } as unknown as ConditionalSuggestions,

        {
          label: 'enhanced',
          insertText: 'enhanced (\n$1\n)',
          insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet
        } as unknown as ConditionalSuggestions,
      ]

      return { suggestions: [...suggestions, ...conditionalSuggestions] }
    }
  })
  return monaco.editor
}
// https://stackoverflow.com/questions/56828421/how-to-make-left-side-original-code-of-monaco-diff-editor-editable
// change witch editor is editable