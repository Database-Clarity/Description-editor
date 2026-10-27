import { PerkTypes } from '@icemourne/description-converter'
import clsx from 'clsx'

import styles from './Select.module.scss'

export function Select({
   children,
   onChange,
   value,
   className = ''
}: {
   children: React.ReactNode
   onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void
   value?: string | number
   className?: string
   name?: string
}) {
   return (
      <select className={clsx(styles.select, className)} onChange={(e) => onChange(e)} value={value}>
         {children}
      </select>
   )
}

interface Props {
   value: PerkTypes;
}

const ReactComponent: React.FC<Props> = ({ value }) => {
   return (

      <option value={value}>{value}</option>

   )
};

export default ReactComponent;
