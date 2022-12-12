import { cnc } from '@utils/classNameCombiner'
import styles from './Button.module.scss'

export function Button({
   children,
   onClick,
   title,
   className = '',
   buttonStatus = false
}: {
   children: React.ReactNode
   onClick: (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void
   title?: string
   className?: string
   buttonStatus?: boolean
}) {
   return (
      <button
         className={cnc(styles.button, className, buttonStatus, styles.active)}
         onClick={(e) => onClick(e)}
         title={title}
      >
         {children}
      </button>
   )
}
