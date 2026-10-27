import styles from './Message.module.scss'
import { useAppSelector } from 'src/redux/hooks'

export function Message() {
   const messages = useAppSelector((state) => state.global.settings.messages)
   return (
      <div className={styles.message}>
         {messages.map((message, i) => (
            <span key={i} className={message.type && styles[message.type]}>
               {message.message}
            </span>
         ))}
      </div>
   )
}
