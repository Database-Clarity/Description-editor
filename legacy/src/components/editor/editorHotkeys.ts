import * as monaco from 'monaco-editor'
import { wrappers } from 'src/data/randomData'

const lineEffecting = wrappers.lineEffecting.map((className) => `(<${className}\/>)`).join('|')

const lineSplitRegex = new RegExp(`(\\|.+?(?=\\|))|(\\|.+?)${lineEffecting}`)

const formatTable = (editorValue: string) => {
   const tables = editorValue.match(/(< table [^]+?\n<\$>)/g)
   if (tables === null) return editorValue

   return tables.reduce((acc, table) => {
      if (!table.match(/< table/)) {
         console.log(table)

         acc = acc + table
         return acc
      }
      const tableLines = table.split('\n')

      let beginningSpacing: { [key: string]: number } = {}
      let endingSpacing: { [key: string]: number } = {}

      tableLines.forEach((line, index, arr) => {
         if (index === 0) return line
         if (index === arr.length - 1) return line
         const splittedLine = line.split(lineSplitRegex).filter((line) => line && line.trim() !== '')

         // set longest |bch length in every column
         splittedLine.forEach((text, index) => {
            beginningSpacing[index] = Math.max(
               beginningSpacing[index] || 0,
               text.match(/\|([bchr\d-]+)?/)?.[0].length || 0
            )
         })
      })

      tableLines.forEach((line, index, arr) => {
         if (index === 0) return line
         if (index === arr.length - 1) return line
         const splittedLine = line.split(lineSplitRegex).filter((line) => line && line.trim() !== '')

         splittedLine.forEach((text, index, arr) => {
            const beginning = text.match(/\|([bchr\d-]+)?/)?.[0] || ''
            const ending = text.replace(beginning, '').trim()

            const textLength = beginningSpacing[index] + ending.length

            endingSpacing[index] = Math.max(endingSpacing[index] || 0, textLength)
         })
      })

      const newTable = tableLines
         .map((line, index, arr) => {
            if (index === 0) return line
            if (index === arr.length - 1) return line

            const splittedLine = line.split(lineSplitRegex).filter((line) => line && line.trim() !== '')

            return splittedLine
               .map((text, index) => {
                  const beginning = text.match(/\|([bchr\d-]+)?/)?.[0] || ''
                  const ending = text.replace(beginning, '').trim()

                  const newLine = [
                     beginning.length === 0 ? '' : `${beginning} `,
                     ' '.repeat(beginningSpacing[index] - beginning.length),
                     ending,
                     ' '.repeat(endingSpacing[index] - ending.length - beginningSpacing[index] + 1)
                  ]

                  return newLine.join('')
               })
               .join('')
               .trim()
         })
         .join('\n')

      acc = acc.replace(table, newTable)

      return acc
   }, editorValue)
}

let hotkeyEventFn: any
export function editorHotkeys(editor: monaco.editor.IStandaloneCodeEditor | monaco.editor.IStandaloneDiffEditor) {
   if (!editor) return
   window.removeEventListener('keyup', hotkeyEventFn)
   const editorHotKey = (e: KeyboardEvent) => {
      if (e.key !== 'ScrollLock') return

      let correctEditor: monaco.editor.IStandaloneCodeEditor
      try {
         // @ts-ignore
         editor.getValue()
         // @ts-ignore
         correctEditor = editor
      } catch {
         // @ts-ignore
         correctEditor = editor.getModifiedEditor()
      }

      const newValue = formatTable(correctEditor.getValue())
      correctEditor.setValue(newValue)
   }
   window.addEventListener('keyup', editorHotKey)
   hotkeyEventFn = editorHotKey
}
