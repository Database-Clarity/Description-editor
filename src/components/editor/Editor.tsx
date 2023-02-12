import * as monaco from 'monaco-editor'
import { useEffect, useState } from 'react'
import { store } from 'src/redux/store'

import { editorHotkeys } from './editorHotkeys'
import { editorUpdater } from './editorUpdater'
import { updateStateOnEdit } from './stateUpdater'

export type EditorInstances = {
   main: monaco.editor.IStandaloneCodeEditor | monaco.editor.IStandaloneDiffEditor
   secondary: monaco.editor.IStandaloneCodeEditor | monaco.editor.IStandaloneDiffEditor
}
let active = false

export default function Editor({ onMount }: { onMount: () => typeof monaco.editor | null }) {
   // start editor this will run after first rended and never again
   const [editor, setEditor] = useState<typeof monaco.editor | null>(null)
   useEffect(() => {
      if (active) return
      active = true
      const editor = onMount()

      setEditor(editor)
   }, [])

   const [editorInstances, setEditorInstances] = useState<EditorInstances>({} as EditorInstances)
   useEffect(() => {
      if (editor === null) return
      let editorInstances = editorUpdater('changeEditor', editor) // also can create editor
      setEditorInstances(editorInstances!)
      let oldGlobalState = store.getState().global

      store.subscribe(() => {
         const newGlobalState = store.getState().global
         const oldSettings = oldGlobalState.settings
         const newSettings = newGlobalState.settings

         if (oldSettings.editorType !== newSettings.editorType) {
            editorInstances = editorUpdater('changeEditor', editor, editorInstances)
            setEditorInstances(editorInstances!)

            if (newSettings.editorType === 'multilanguage') {
               document.documentElement.style.setProperty('--highlightColorDelete', 'unset')
               document.documentElement.style.setProperty('--highlightColorInsert', 'unset')
            } else {
               document.documentElement.style.setProperty('--highlightColorDelete', 'rgba(255, 0, 0, 0.44)')
               document.documentElement.style.setProperty('--highlightColorInsert', 'rgba(160, 191, 86, 0.32)')
            }
         }

         if (
            oldSettings.language !== newSettings.language ||
            oldSettings.currentlySelected !== newSettings.currentlySelected
         ) {
            editorUpdater('updateDescription', editor, editorInstances)
         }
         oldGlobalState = newGlobalState
      })
   }, [editor])

   useEffect(() => {
      updateStateOnEdit(editorInstances)
      editorHotkeys(editorInstances.main)
   }, [editorInstances])

   const [editorSize, setEditorSize] = useState(localStorage.getItem('editorSize') || '60')
   useEffect(() => {
      localStorage.setItem('editorSize', editorSize)
   }, [editorSize])
   return (
      <div className="editor-container">
         <div className="editor">
            <div id="main-editor" style={{ height: `${editorSize}%` }}></div>
            <div id="secondary-editor" style={{ height: `${100 - Number(editorSize)}%` }}></div>
         </div>
         <div className="slider">
            <input type="range" value={editorSize} min="2" max="98" onChange={(e) => setEditorSize(e.target.value)} />
         </div>
      </div>
   )
}
