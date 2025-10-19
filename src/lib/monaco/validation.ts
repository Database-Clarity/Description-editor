import type Monaco from 'monaco-editor'

export function validate(model: Monaco.editor.ITextModel | null, monaco: typeof Monaco | undefined) {
  if (model === null) return
  if (monaco === undefined) return

  const text = model.getValue()
  const markers = []

  // Simple check: opener without closer
  // const importOpen = /^title [A-z0-9 ]+? \(/.exec(text)
  // const hasCloser = /\)/.test(text)

  // if (importOpen && !hasCloser) {
  //   markers.push({
  //     severity: monaco.MarkerSeverity.Error,
  //     message: "Missing closing ')'",
  //     startLineNumber: model.getPositionAt(importOpen.index).lineNumber,
  //     startColumn: model.getPositionAt(importOpen.index).column,
  //     endLineNumber: model.getPositionAt(importOpen.index + importOpen[0].length).lineNumber,
  //     endColumn: model.getPositionAt(importOpen.index + importOpen[0].length).column,
  //   })
  // }

  // const textLines = text.split('\n')

  // for (let i = 0;i < textLines.length;i++) {
  //   const line = textLines[i]


  //   const importStatement = /import from \d+/.exec(line)

  // }


  monaco.editor.setModelMarkers(model, 'owner', markers)
}