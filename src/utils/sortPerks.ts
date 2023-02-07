import { store } from 'src/redux/store'

export function sortPerks() {
   const { database, settings } = store.getState().global

   const selectedPerkHashes = Object.keys(database).filter((hash) => database[hash].type === settings.selectedType)

   const sortedPerkHashes = selectedPerkHashes.sort((a, b) => {
      if (database[a].itemName && database[b].itemName) {
         return database[a].itemName!.localeCompare(database[b].itemName!)
      }
      return database[a].name.localeCompare(database[b].name)
   })

   // filter out duplicates exotic weapons
   const filteredPerkHashes =
      settings.selectedType === 'Weapon Frame Exotic'
         ? sortedPerkHashes.filter((hash, index) => {
              if (index === 0) return true
              return database[hash].itemName !== database[sortedPerkHashes[index - 1]].itemName
           })
         : sortedPerkHashes

   return filteredPerkHashes
}
