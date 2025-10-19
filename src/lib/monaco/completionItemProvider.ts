import type Monaco from 'monaco-editor'
import monaco from 'monaco-editor'
import type { languages } from 'monaco-editor'

//kind: Color, for textModifiers

function singleLineComment(text: string, i: number) {
  if (text.slice(i, i + 2) === '//' && text.slice(i - 1, i + 2) !== '://') {
    i = text.indexOf('\r\n') - i
    return {
      token: {
        type: 'comment',
        start: { line: 0, col: i },
        end: { line: 0, col: text.indexOf('\r\n') - i },
      },
      offset: i
    }
  }
}

function getTextBeforeAndAfter(lineIndex: number, columnIndex: number, lines: string[]) {
  const textBeforePosition = lines.slice(0, lineIndex).join('\n') + '\n' + lines[lineIndex].slice(0, columnIndex)
  const textAfterPosition = lines[lineIndex].slice(columnIndex) + '\n' + lines.slice(lineIndex + 1).join('\n')
  return { textBeforePosition, textAfterPosition }
}

const provideCompletionItems: languages.CompletionItemProvider['provideCompletionItems'] = (model, position, context, token) => {
  const word = model.getWordUntilPosition(position)
  const line = model.getLineContent(position.lineNumber)
  const lines = model.getLinesContent()
  const text = lines.join('\n')

  const textBeforePosition = model.getValueInRange({
    startLineNumber: 1,
    startColumn: 1,
    endLineNumber: position.lineNumber,
    endColumn: position.column,
  })
  const textAfterPosition = model.getValueInRange({
    startLineNumber: position.lineNumber,
    startColumn: position.column,
    endLineNumber: model.getLineCount(),
    endColumn: model.getLineMaxColumn(model.getLineCount()),
  })

  const suggestions = new Set([
    'variableIdentifier',
    'link',
    'image',
    'textModifier',
    'variableDeclaration',
    'enhanced',
    'tooltip',
    'perkImport',
  ] as const)

  // these can't have any text before them in the same line
  if (line.slice(0, position.column).trim() !== '') {
    const blacklist = ['enhanced', 'tooltip', 'perkImport', 'variableDeclaration'] as const
    for (let i = 0;i < blacklist.length;i++) {
      suggestions.delete(blacklist[i])
    }
  }

  // /\s*(?:enhanced|tooltip.+?)\s+\(/.test(textBeforePosition)

  if (textBeforePosition.indexOf('enhanced') !== -1 || textBeforePosition.indexOf('tooltip') !== -1) {
    for (let i = position.lineNumber - 1;i >= 0;i--) {
      if (lines[i].trim().startsWith('enhanced')) {

      }
      if (lines[i].trim().startsWith('tooltip')) {

      }

    }
  }


































  // const loopDeLoop = (lineIndex: number, columnIndex: number, array: string[], fn: (lineIndex: number, columnIndex: number, line: string) => any) => {
  //   for (let i = 0;i < array.length;i++) {
  //     for (let y = 0;y < array[i].length;y++) {
  //       const data = fn(lineIndex, columnIndex, line)
  //       if (data) return data
  //     }
  //   }
  // }

  // loopDeLoop(0, 0, lines, (lineIndex, columnIndex, line) => {
  //   console.log(lineIndex, columnIndex, line)
  // })

  // for (let l = 0;l < lines.length;l++) {
  //   const line = lines[l]
  //   for (let c = 0;c < line[c].length;c++) {

  //     // single line comment
  //     if (line.slice(c, c + 2) === '//' && text.slice(c - 1, c + 2) !== '://') {
  //       l++
  //       autoCompletionItems.push({
  //         type: 'comment',
  //         start: { line: l, col: c },
  //         end: { line: l, col: line.length },
  //       })
  //       break
  //     }

  //     // multi line comment
  //     if (line.slice(c, c + 2) === '/*') {
















  //     }
  //   }
  // }




  // for (let i = 0;i < text.length;i++) {
  //   const character_1 = text[i]
  //   const character_1_2 = text[i] + text[i + 1]

  //   const singleLineCommentData = singleLineComment(text, i)
  //   if (singleLineCommentData) {
  //     autoCompletionItems.push(singleLineCommentData.token)
  //     i = singleLineCommentData.offset
  //     continue
  //   }

  //   // comment
  //   if (text.slice(i, i + 2) === '//' && text.slice(i - 1, i + 2) !== '://') {
  //     i = text.indexOf('\r\n') - i
  //     autoCompletionItems.push({
  //       type: 'comment',
  //       start: { line: 0, col: i },
  //       end: { line: 0, col: text.indexOf('\r\n') - i },
  //     })
  //   }

  //   if (text.slice(i, i + 8) === 'enhanced') {

  //   }

  // }


  // let enhancedTooltipPositions = []

  // for (let i = 0;i < lines.length;i++) {
  //   const line = lines[i].trimStart()
  //   const bracesOpenIndex = line.indexOf('(')

  //   if (bracesOpenIndex !== -1 && (line.startsWith('enhanced') || line.startsWith('tooltip'))) {
  //     enhancedTooltipPositions.push({
  //       start: [i, 0, bracesOpenIndex]
  //     })
  //   }

  //   if (line.startsWith(')')) {

  //   }
  // }






  // const range = {
  //   startLineNumber: position.lineNumber,
  //   endLineNumber: position.lineNumber,
  //   startColumn: word.startColumn,
  //   endColumn: word.endColumn,
  // }

  // let suggestions: languages.CompletionItem[] = []

  // let inEnhanced = false
  // let inTooltip = false
  // let inComment = false





  return { suggestions: Array.from(suggestions.values()) }
}

export const completionItemProvider: languages.CompletionItemProvider = {
  provideCompletionItems
}
