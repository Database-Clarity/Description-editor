import { addMessage, removeLastMessage } from "src/redux/globalSlice"
import { store } from "src/redux/store"

export function sendMessage(message: string, type?: 'error' | 'success') {
   store.dispatch(addMessage({message, type}))
   setTimeout(()=> {
      store.dispatch(removeLastMessage())
   }, 15000)
}