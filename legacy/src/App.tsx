import './App.scss'

import { StrictMode, useState } from 'react'
import ReactDOM from 'react-dom/client'
import { ErrorBoundary } from 'react-error-boundary'
import { Provider } from 'react-redux'

import Editor from './components/editor/Editor'
import { createEditor } from './components/editor/monaco/monacoEditor'
import { Header } from './components/itemPopup/Header'
import { Perks } from './components/itemPopup/Perks'
import { BasicInfo } from './components/sideBar/BasicItemInfo'
import {
   ButtonChangeEditor,
   ButtonUploadIntermediate,
   ButtonUploadLive,
   MultiButton,
   ResetDescription,
   RestoreBackup,
   ToggleGlobalUploadToLive
} from './components/sideBar/Buttons'
import { LanguageSelection } from './components/sideBar/LanguageSelection'
import { Login } from './components/sideBar/Login'
import { Message } from './components/sideBar/Message'
import { DescriptionTypeSelection, PerkSelection } from './components/sideBar/Selection'
import { NewStatSelection } from './components/sideBar/stats/StatDisplay'
import { UpdateTracker } from './components/sideBar/UpdateTracker'
import { Button } from './components/universal/Button'
import { VerticalDivider } from './components/universal/VerticalDivider'
import { changePerkType, changeSelectedPerk } from './redux/globalSlice'
import { useAppDispatch } from './redux/hooks'
import { store } from './redux/store'

function ErrorFallback(setExplode: React.Dispatch<React.SetStateAction<boolean>>) {
   const dispatch = useAppDispatch()

   const onReset = () => {
      dispatch(changePerkType('none'))
      dispatch(changeSelectedPerk(0))
      setExplode((e) => !e)
   }

   return (
      <div>
         <h1>Something went wrong</h1>
         <h3>I would recommend uploading before doing anything else</h3>
         <h3>You will get confirmation message then upload is complete</h3>
         <h3>Well unless upload caused crash then F</h3>
         <ButtonUploadIntermediate labelText="Upload - Secondary Database" />

         <h3>You can try resetting depending on why it crashed that maybe will fix it</h3>
         <h3>If nothing happens then you press button it means it crashed again and you need to reload</h3>
         <Button onClick={onReset}>Reset</Button>

         <Message />
      </div>
   )
}

function App() {
   const [explode, setExplode] = useState(false)
   return (
      <ErrorBoundary
         FallbackComponent={() => ErrorFallback(setExplode)}
         onReset={() => setExplode(false)}
         resetKeys={[explode]}
      >
         <div className="main">
            <div className="item_popup">
               <Header />
               <Perks />
               <NewStatSelection />
            </div>
            <Editor onMount={createEditor} />
            <div className="side_bar">
               <>
                  <DescriptionTypeSelection />
                  <PerkSelection />
                  <LanguageSelection />
                  <BasicInfo />
                  <VerticalDivider />

                  <ButtonChangeEditor />
                  <ResetDescription />
                  <VerticalDivider />

                  <RestoreBackup />
                  <VerticalDivider />

                  <ToggleGlobalUploadToLive />
                  <MultiButton action="uploadToLive" />
                  <ButtonUploadLive labelText="Upload - Live database" />
                  <ButtonUploadIntermediate labelText="Upload - Secondary Database" />
                  <VerticalDivider />

                  <Message />
                  <Login />

                  <VerticalDivider />
                  <UpdateTracker />
               </>
            </div>
         </div>
      </ErrorBoundary>
   )
}

ReactDOM.createRoot(document.getElementById('app')!).render(
   <StrictMode>
      <Provider store={store}>
         <App />
      </Provider>
   </StrictMode>
)
