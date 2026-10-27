import { extractTitles, getVariables, weaponTypes } from '@icemourne/description-converter'
import * as monaco from 'monaco-editor'
import { wrappers } from 'src/data/randomData'
import { store } from 'src/redux/store'

import { ConditionalSuggestions } from './monacoEditor'

const conditionalSuggestions: {
   [key: string]: {
      label: string
      insertText: string
      documentation: string
   }[]
} = {
   table: [
      {
         label: 'center',
         insertText: 'center',
         documentation: ''
      },
      {
         label: 'wide',
         insertText: 'wide',
         documentation: ''
      },
      {
         label: 'formula',
         insertText: 'formula',
         documentation: ''
      },
      {
         label: ' background_1',
         insertText: 'background_1',
         documentation: ''
      },
      {
         label: 'background_2',
         insertText: 'background_2',
         documentation: ''
      }
   ],
   weaponType: [
      ...weaponTypes.map((weapon) => ({
         label: weapon,
         insertText: weapon,
         documentation: ''
      })),
      {
         label: 'other',
         insertText: 'other',
         documentation: 'All not specified weapons will have this description'
      }
   ]
}

const normalSuggestions = [
   {
      label: 'import all from specific perks main',
      insertText: 'import main from $0',
      documentation: `Imports everything from main (top) editor of selected perk`
   },
   {
      label: 'import all from specific perks secondary',
      insertText: 'import secondary from $0',
      documentation: `Imports everything from secondary (bottom) editor of selected perk`
   },
   {
      label: 'import',
      insertText: 'import ${1:unique name} from $0',
      documentation: `Imports exported part of description from specified perk`
   },
   {
      label: 'import all from self',
      insertText: 'import self',
      documentation: `Imports everything from opposite editor`
   },
   {
      label: 'export',
      insertText: ['export ${1:unique name} (', '$0', ')'].join('\n'),
      documentation: `Exports text inside allowing reusability of text in other descriptions\nText in other descriptions will always match exported text`
   },
   {
      label: 'variable',
      insertText: 'var ${1:name} = ${0:value}',
      documentation: `Variable with value specific to this perk if descriptions vas imported to other perk you can define new variable to have different value on other perk`
   },
   // ----------------------------------------------------------------
   {
      label: 'weapon type block',
      insertText: ['< weapon type ( ${1:weapon type} ) >', '$0', '<$$>'].join('\n'),
      documentation: `Text inside will only appear on specified weapon types.`
   },
   {
      label: 'weapon type',
      insertText: ['< ( ${1:weapon type} ) >', '$0'].join('\n'),
      documentation: `Text inside will only appear on specified weapon types.`
   },
   // ----------------------------------------------------------------
   {
      label: 'title',
      insertText: '<title ${1: } [${2:name}] />',
      documentation: `Title witch will show up in description\nRequires tittle content.`
   },
   {
      label: 'titles contents',
      insertText: ['title ${1:name} (', '$0', ')'].join('\n'),
      documentation: `Content of title. Content can only be used on this perk`
   },
   // ----------------------------------------------------------------
   {
      label: 'table',
      insertText: ['< table >', '$0', '<$>'].join('\n'),
      documentation: `< table > optionally can have center, formula, wide ex < table wide formula >\n |\tnormal text\n |b\tbold text\n |c\tcentered text\n |r\tmoves text to right side\n |h\tadd background\n\tall of them can be combined for example\n |bc\tmakes bold centered text\n<$>`
   }
   // ----------------------------------------------------------------
   // {
   //    label: 'import',
   //    insertText: 'import ${1:unique name} from $0',
   //    documentation: `Imports exported part of description with same name as export`
   // },
]

const settings = {
   kind: monaco.languages.CompletionItemKind.Text,
   insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet
} as {
   kind: monaco.languages.CompletionItemKind.Text
   insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet
   range: monaco.Range
}

type Conditions = 'table' | 'weaponType'

export function createConditionalSuggestions(line: string, condition: Conditions) {
   const suggestions: monaco.languages.CompletionItem[] = []

   conditionalSuggestions[condition].forEach((suggestion) => {
      if (!line.includes(suggestion.insertText)) {
         suggestions.push({
            ...suggestion,
            ...settings
         })
      }
   })

   return suggestions
}

export function imports(line: string) {
   let perkSuggestions: { label: string; insertText: string }[] = []

   if (line.match(/import .+? from /) !== null) {
      const database = store.getState().global.database

      Object.entries(database).forEach(([hash, perk]) => {
         perkSuggestions.push({
            label: perk.itemName
               ? `${perk.itemName}${' '.repeat(Math.max(25 - perk.itemName.length, 0))} => ${perk.type}`
               : `${perk.name}${' '.repeat(Math.max(25 - perk.name.length, 0))} => ${perk.type}`,
            insertText: hash
         })
      })
   }

   const suggestions = perkSuggestions.map(
      ({ label, insertText }) =>
         ({
            label,
            insertText,
            kind: monaco.languages.CompletionItemKind.Snippet,
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.KeepWhitespace
         } as unknown as ConditionalSuggestions)
   )
   return suggestions
}

export function createNormalSuggestions() {
   return normalSuggestions.reduce((acc, suggestion) => {
      acc.push({
         ...suggestion,
         ...settings
      })
      return acc
   }, [] as monaco.languages.CompletionItem[])
}

export function createWrapperSuggestions() {
   const withText = wrappers.textEffecting.reduce((acc, wrapper) => {
      acc.push({
         label: `${wrapper} text`,
         insertText: `<${wrapper} $1 />`,
         documentation: ``,
         ...settings
      })
      return acc
   }, [] as monaco.languages.CompletionItem[])

   const lineEffecting = wrappers.lineEffecting.reduce((acc, wrapper) => {
      acc.push({
         label: `${wrapper} line`,
         insertText: `<${wrapper}/>`,
         documentation: ``,
         ...settings
      })
      return acc
   }, [] as monaco.languages.CompletionItem[])

   const imageAdding = wrappers.imageAdding.reduce((acc, wrapper) => {
      acc.push({
         label: `${wrapper} img`,
         insertText: `<${wrapper}/>`,
         documentation: ``,
         ...settings
      })
      return acc
   }, [] as monaco.languages.CompletionItem[])

   return [...withText, ...lineEffecting, ...imageAdding]
}

export function variableSuggestions(description: string) {
   const globalState = store.getState().global
   const database = globalState.database
   const language = globalState.settings.language

   const variables = {
      ...getVariables(description),
      ...getVariables(database[2].editor[language]?.main || ''),
      ...getVariables(database[2].editor[language]?.secondary || '')
   }

   return Object.keys(variables).reduce((acc, variable) => {
      acc.push({
         label: `${variable}`,
         insertText: `${variable}`,
         documentation: ``,
         ...settings
      })
      return acc
   }, [] as monaco.languages.CompletionItem[])
}

export function titleSuggestions(description: string) {
   const globalState = store.getState().global
   const database = globalState.database
   const language = globalState.settings.language

   const titles = {
      ...extractTitles(description),
      ...extractTitles(database[3].editor[language]?.main || ''),
      ...extractTitles(database[3].editor[language]?.secondary || '')
   }

   return Object.keys(titles).reduce((acc, title) => {
      acc.push({
         label: `${title}`,
         insertText: `${title}`,
         documentation: ``,
         ...settings
      })
      return acc
   }, [] as monaco.languages.CompletionItem[])
}
