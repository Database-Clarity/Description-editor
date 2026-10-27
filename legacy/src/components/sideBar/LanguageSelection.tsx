import { Languages, languages } from '@icemourne/description-converter'
import { changeLanguage } from 'src/redux/globalSlice'
import { useAppDispatch } from 'src/redux/hooks'

import { Select } from '../universal/Select'
import styles from './LanguageSelection.module.scss'

export function LanguageSelection() {
   const dispatch = useAppDispatch()

   const onLanguageChange = (language: Languages) => {
      dispatch(changeLanguage(language))
   }

   return (
      <Select className={styles.selection} onChange={(e) => onLanguageChange(e.target.value as Languages)}>
         {languages.map((language, i) => (
            <option value={language[0]} key={i}>{language[1]}</option>
         ))}
      </Select>
   )
}
