import * as monaco from 'monaco-editor'

import { createConditionalSuggestions, createNormalSuggestions, createWrapperSuggestions, imports, titleSuggestions, variableSuggestions } from './autoCompletion'

import { selfContainedArr } from 'src/data/randomData'
import { weaponTypes } from '@icemourne/description-converter'

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
      [/ \/\/.*$/, { token: 'darkGreen'                   }],
      [/^\/\/.*$/, { token: 'darkGreen'                   }],
      [/\/\*/,     { token: 'darkGreen', next: '@comment' }]
   ]

   monaco.languages.register({ id: 'clarityLangue' })
   monaco.languages.setMonarchTokensProvider('clarityLangue', {
      selfContained: selfContainedArr.map((w) => `<${w}/>`).join('|'),

      weapons: [
         ...weaponTypes,
         'other'
      ]
         .map((w) => ` ${w},? ?`)
         .join('|'),

      highlightRegex: /<(green|blue|purple|yellow|bold|pve|pvp)/,

      // prettier-ignore
      tokenizer: {
         root: [
            [/^import [A-z0-9 ]+? from (\d+?|global)/,      { token: '@rematch', next: '@import' }],
            [/^import self/,                                { token: '@rematch', next: '@import' }],
            [/^(export|title) [A-z0-9 ]+? \(/,              { token: '@rematch', next: '@export' }],
            [/^enhanced \(/,                                { token: '@rematch', next: '@export' }],

            [/^< table( wide| center| formula| background_1| background_2){0,3}? >/, { token: 'blue', next: '@table' }], // table start

            [/^< (weapon type )?\(@weapons{0,20}? \) >/, { token: '@rematch', next: '@weaponType' }],
            [/^<\$\$>/,                               { token: 'blue' }],

            [/@selfContained/,  { token: 'green' }],
            [/@highlightRegex/, { token: 'blue', next: '@highlight' }],

            [/<(formula |link |title )/, { token: 'green',  next: '@extra' }],
            [/\${.*?/,                   { token: 'yellow', next: '@math' }],

            [/var .+? = /, { token: '@rematch', next: '@variable' }],
            [/#[A-z0-9]+/, { token: 'green' }],

            ...comments
         ],

         import: [
            [/(^import | from )/,    { token: 'purple'    }],
            [/[A-z0-9 ]+?(?= from)/, { token: 'lightBlue' }],
            [/([0-9]+|self|global)/, { token: 'lightBlue', next: '@pop' }]
         ],
         export: [
            [/^(export|title|enhanced) /, { token: 'purple'    }], // word export/title/enhanced
            [/[A-z0-9 ]+?(?= \()/,        { token: 'lightBlue' }], // exports name
            [/\( *?$/,                    { token: 'purple'    }], // (

            [/^< table( wide| center| formula| background_1| background_2){0,3}? >/, { token: 'blue', next: '@table' }], // table start

            [/^< (weapon type )?\(@weapons{0,20}?\) >/, { token: '@rematch', next: '@weaponType' }],
            [/^<\$\$>/,                              { token: 'blue' }],

            [/@selfContained/,  { token: 'green' }],
            [/@highlightRegex/, { token: 'blue', next: '@highlight'}],

            [/<(formula |link |title )/, { token: 'green',  next: '@extra' }],
            [/\${.*?/,                   { token: 'yellow', next: '@math' }],

            [/var .+? = /, { token: '@rematch', next: '@variable' }],
            [/#[A-z0-9]+/, { token: 'green' }],

            ...comments,
            [/^import [A-z0-9 ]+? from (\d+?|global)/, { token: '@rematch', next: '@import' }],

            [/^\)/, { token: 'purple', next: '@pop' }], // end of export
         ],

         weaponType: [
            [/^< (weapon type )?/,       { token: 'blue'}],
            [/\(@weapons{0,20}? \)/,  { token: 'grey' }],
            [/ >/,                    { token: 'blue', next: '@pop' }],
         ],

         table: [
            [/^<\$>/,            { token: 'blue', next: '@pop' }], // table end
            [/\|[bchr\d-]{0,5}/, { token: 'blue' }], // table only content

            ...comments,

            [/#[A-z0-9]+/,               { token: 'green' }],
            [/@selfContained/,           { token: 'green' }],
            [/@highlightRegex/,          { token: 'blue',   next: '@highlight' }],
            [/<(formula |link |title )/, { token: 'green',  next: '@extra' }],
            [/\${.*?/,                   { token: 'yellow', next: '@math' }]
         ],

         highlight: [
            [/\/>/,        { token: 'blue',   next: '@pop' }],
            [/\${.*?/,     { token: 'yellow', next: '@math' }],
            [/#[A-z0-9]+/, { token: 'green' }],
         ],
         extra: [
            [/ \/>/,       { token: 'green',  next: '@pop' }],
            [/\[.+?\]/,    { token: 'blue' }],
            [/\${.*?/,     { token: 'yellow', next: '@math' }],
            [/#[A-z0-9]+/, { token: 'green' }],
         ],
         math: [
            [/}/,          { token: 'yellow', next: '@pop' }],
            [/#[A-z0-9]+/, { token: 'green' }],
         ],
         variable: [
            [/ = /,       { token: 'purple', next: '@pop' }],
            [/var /,      { token: 'purple' }],
            [/[A-z0-9]+/, { token: 'lightBlue' }]
         ],
         comment: [
            [/\*\//, { token: 'darkGreen', next: '@pop' }],
            [/[^]/,  { token: 'darkGreen' }]
         ]
      }
   })
   monaco.editor.defineTheme('myCoolTheme', {
      base: 'vs',
      inherit: false,
      // prettier-ignore
      rules: [
         { token: 'green',     foreground: '4ec9b0' }, // class green
         { token: 'blue',      foreground: '4fc1ff' }, // const blue
         { token: 'purple',    foreground: 'c586c0' }, // export purple
         { token: 'lightBlue', foreground: '9cdcfe' }, // let blue
         { token: 'yellow',    foreground: 'dcdcaa' }, // function yellow
         { token: 'darkGreen', foreground: '6a9955' }, // comment green
         { token: 'grey',      foreground: '858585' }, // 9d9d9d

      ],
      // prettier-ignore
      colors: {
         'editor.foreground':                 '#ffffff',   // normal text | white
         'editor.background':                 '#1e1e1e',   // editor background | dark grey
         'editorLineNumber.foreground':       '#858585',   // line number | grey
         'editorLineNumber.activeForeground': '#c6c6c6',   // active line number | light grey
         'editorCursor.foreground':           '#ffffff',   // blinking thing | white
         'editor.lineHighlightBorder':        '#fff0',     // active line border | transparent
         'editor.selectionBackground':        '#004972b8', // selected text background | blue // todo: color needs some work
         'editorSuggestWidget.background':    '#252526',   // suggestion background
         'editorSuggestWidget.border':        '#454545',   // suggestion border
         'list.hoverBackground':              '#2a2d2e',   // dropdown hover over
         'foreground':                        '#78a8f6',   // image color in dropdown
         // split view
         'diffEditor.removedTextBackground':  '#ff000070', // removed text background
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
