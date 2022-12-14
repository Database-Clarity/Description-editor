import { ButtonActions, getPerk } from 'src/redux/reducers/dataBase'
import { changeEditorType, resetPerk, toggleHiddenPerkDisplay, togglePerkStuff, toggleUploadToLiveOnEdit } from 'src/redux/globalSlice'
import { useAppDispatch, useAppSelector } from 'src/redux/hooks'

import { IntermediatePerk } from '@icemourne/description-converter'
import { cnc } from 'src/utils/classNameCombiner'
import styles from './Buttons.module.scss'
import { uploadDescriptions } from 'src/descriptionUpload/uploadDescriptions'
import { useState } from 'react'

export function MultiButton({ action }: { action: ButtonActions }) {
   const dispatch = useAppDispatch()
   const buttonStatus = getPerk()[action]


   // TODO: remove this
   // const database = useAppSelector((state) => state.global.database)

   // console.log(
   //    Object.values(database).flatMap((perk_) => {
   //       const perk = perk_ as IntermediatePerk

   //       if (perk.stats?.rateOfFire) {
   //          return perk.name
   //       }
   //       return []
   //    })
   // )

   const labels = {
      active: {
         uploadToLive: `Don't upload to Live`,
         hidden: 'Show Perk',
         optional: 'Revert to Normal Description'
      },
      inactive: {
         uploadToLive: 'Select for upload to Live',
         hidden: 'Hide Perk',
         optional: 'Set as Optional'
      }
   }

   return (
      <button
         className={cnc(styles.button, buttonStatus, styles.active)}
         onClick={() => dispatch(togglePerkStuff(action))}
      >
         {buttonStatus ? labels.active[action] : labels.inactive[action]}
      </button>
   )
}

export function ButtonChangeEditor() {
   const [buttonState, setButtonState] = useState(0)
   const dispatch = useAppDispatch()

   const changeEditor = () => {
      switch (buttonState) {
         case 0:
            setButtonState(1)
            dispatch(changeEditorType('dual'))
            break
         case 1:
            setButtonState(2)
            dispatch(changeEditorType('multilanguage'))
            break
         case 2:
            setButtonState(0)
            dispatch(changeEditorType('normal'))
            break
      }
   }
   const labels = ['Switch to dual editor', 'Switch to multi langue editor', 'Switch to single editor']
   return (
      <button className={styles.button} onClick={changeEditor}>
         {labels[buttonState]}
      </button>
   )
}

export function ButtonUploadLive({ labelText }: { labelText: string }) {
   return (
      <button className={styles.button} onClick={() => uploadDescriptions('live', true)}>
         {labelText}
      </button>
   )
}

export function ButtonUploadIntermediate({ labelText }: { labelText: string }) {
   return (
      <button className={styles.button} onClick={() => uploadDescriptions('intermediate', false)}>
         {labelText}
      </button>
   )
}

export function ButtonToggleHiddenPerks() {
   const dispatch = useAppDispatch()
   const displayHiddenPerks = useAppSelector((state) => state.global.settings.displayHiddenPerks)
   const labelText = displayHiddenPerks ? 'Hide Hidden Perks' : 'Show Hidden Perks'

   return (
      <button
         className={cnc(styles.button, displayHiddenPerks, styles.active)}
         onClick={() => dispatch(toggleHiddenPerkDisplay())}
      >
         {labelText}
      </button>
   )
}

export function ResetDescription() {
   const dispatch = useAppDispatch()
   const settings = useAppSelector((state) => state.global.settings)

   return (
      <>
         {settings.editorType === 'dual' && (
            <button className={styles.button} onClick={() => dispatch(resetPerk(settings.currentlySelected))}>
               Reset perk to live versions
            </button>
         )}
      </>
   )
}

export function ToggleGlobalUploadToLive() {
   const dispatch = useAppDispatch()
   const globalUploadToLive = useAppSelector((state) => state.global.settings.globalUploadToLive)
   const labelText = globalUploadToLive ? `Don't select for live on edit` : 'Select for live on edit'

   return (
      <button
         className={cnc(styles.button, globalUploadToLive, styles.active)}
         onClick={() => dispatch(toggleUploadToLiveOnEdit())}
      >
         {labelText}
      </button>
   )
}
