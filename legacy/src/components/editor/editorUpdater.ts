import * as monaco from 'monaco-editor'
import { EditorInstances } from './Editor'
import { store } from 'src/redux/store'

type EditorActions = 'changeEditor' | 'updateDescription'

const defaultSettings = {
   theme: 'myCoolTheme',
   language: 'clarityLangue',
   minimap: {
      enabled: false
   },
   automaticLayout: true,
   wordWrap: 'on' as const,
   mouseWheelZoom: true
}
const normalSettings = {
   ...defaultSettings,
   lineNumbersMinChars: 2,
   lineDecorationsWidth: 0
}
const diffSettings = {
   ...defaultSettings,
   lineNumbersMinChars: 3,
   lineDecorationsWidth: 15,
   renderOverviewRuler: false,
   renderIndicators: false
}

export function editorUpdater(action: EditorActions, editor: typeof monaco.editor, editorInstances?: EditorInstances) {
   const globalState = store.getState().global
   let newEditorInstances: EditorInstances | undefined = editorInstances
   const changeEditor = () => {
      editorInstances?.main.dispose()
      editorInstances?.secondary.dispose()
      if (globalState.settings.editorType === 'normal') {
         const editors = {
            main: editor.create(document.querySelector('#main-editor')!, normalSettings),
            secondary: editor.create(document.querySelector('#secondary-editor')!, normalSettings)
         }
         newEditorInstances = editors
      } else {
         const editors = {
            main: editor.createDiffEditor(document.querySelector('#main-editor')!, diffSettings),
            secondary: editor.createDiffEditor(document.querySelector('#secondary-editor')!, diffSettings)
         }
         editors.main.setModel({
            modified: editor.createModel('', 'clarityLangue'),
            original: editor.createModel('', 'clarityLangue')
         })
         editors.secondary.setModel({
            modified: editor.createModel('', 'clarityLangue'),
            original: editor.createModel('', 'clarityLangue')
         })
         newEditorInstances = editors
      }
   }

   const updateDescriptions = () => {
      const currentlySelected = globalState.settings.currentlySelected
      const editorType = globalState.settings.editorType
      const langue = globalState.settings.language

      const database = globalState.database
      const liveDatabase = globalState.originalDatabase.live

      const selectedPerkDescriptions = database[currentlySelected].editor || {}
      const selectedLivePerkDescriptions = liveDatabase[currentlySelected]?.editor || {}

      const setValue = (
         editor: monaco.editor.IStandaloneCodeEditor | monaco.editor.IStandaloneDiffEditor,
         value: string = '',
         type?: 'modified' | 'original'
      ) => {
         if (editorType === 'normal') {
            ;(editor as monaco.editor.IStandaloneCodeEditor).setValue(value)
         }
         if (type === 'modified') {
            ;(editor as monaco.editor.IStandaloneDiffEditor).getModifiedEditor().setValue(value)
         }
         if (type === 'original') {
            ;(editor as monaco.editor.IStandaloneDiffEditor).getOriginalEditor().setValue(value)
         }
      }

      if (editorType === 'normal') {
         setValue(newEditorInstances!.main, selectedPerkDescriptions[langue]?.main)
         setValue(newEditorInstances!.secondary, selectedPerkDescriptions[langue]?.secondary)
      }
      if (editorType === 'dual') {
         setValue(newEditorInstances!.main, selectedPerkDescriptions[langue]?.main, 'modified')
         setValue(newEditorInstances!.main, selectedLivePerkDescriptions[langue]?.main, 'original')

         setValue(newEditorInstances!.secondary, selectedPerkDescriptions[langue]?.secondary, 'modified')
         setValue(newEditorInstances!.secondary, selectedLivePerkDescriptions[langue]?.secondary, 'original')
      }
      if (editorType === 'multilanguage') {
         setValue(newEditorInstances!.main, selectedPerkDescriptions[langue]?.main, 'modified')
         setValue(newEditorInstances!.main, selectedPerkDescriptions.en?.main, 'original')

         setValue(newEditorInstances!.secondary, selectedPerkDescriptions[langue]?.secondary, 'modified')
         setValue(newEditorInstances!.secondary, selectedPerkDescriptions.en?.secondary, 'original')
      }
   }

   switch (action) {
      case 'changeEditor':
         changeEditor()
         updateDescriptions()
         break
      case 'updateDescription':
         updateDescriptions()
         break
   }

   return newEditorInstances
}
