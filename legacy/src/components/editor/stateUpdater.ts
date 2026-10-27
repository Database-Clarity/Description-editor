import * as monaco from 'monaco-editor'
import { EditorInstances } from './Editor'
import { store } from 'src/redux/store'
import { updateEditorValue } from 'src/redux/globalSlice'

export function updateStateOnEdit(editorInstances: EditorInstances) {
   // stale global state is updated only then editor type changes
   const staleGlobalState = store.getState().global
   const instances = {
      normal: {
         main: editorInstances?.main as monaco.editor.IStandaloneCodeEditor,
         secondary: editorInstances?.secondary as monaco.editor.IStandaloneCodeEditor
      },
      diff: {
         main: editorInstances?.main as monaco.editor.IStandaloneDiffEditor,
         secondary: editorInstances?.secondary as monaco.editor.IStandaloneDiffEditor
      }
   }

   if (staleGlobalState.settings.editorType === 'normal') {
      instances.normal.main?.getModel()?.onDidChangeContent((e) => {
         if (e.isFlush) return
         const editorValue = instances.normal.main?.getValue()
         store.dispatch(updateEditorValue([editorValue, 'main']))
      })

      instances.normal.secondary?.getModel()?.onDidChangeContent((e) => {
         if (e.isFlush) return
         const editorValue = instances.normal.secondary?.getValue()
         store.dispatch(updateEditorValue([editorValue, 'secondary']))
      })
   } else {
      instances.diff.main?.getModel()?.modified?.onDidChangeContent((e) => {
         if (e.isFlush) return
         const editorValue = instances.diff.main.getModifiedEditor()?.getValue()
         store.dispatch(updateEditorValue([editorValue, 'main']))
      })
      instances.diff.secondary?.getModel()?.modified?.onDidChangeContent((e) => {
         if (e.isFlush) return
         const editorValue = instances.diff.secondary.getModifiedEditor()?.getValue()
         store.dispatch(updateEditorValue([editorValue, 'secondary']))
      })
   }
}
