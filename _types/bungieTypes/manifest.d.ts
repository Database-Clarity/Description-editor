import { InventoryItem } from './inventoryItem.js'
import { PlugSet } from './plugSet.js'
import { SocketType } from './socketType.js'
import { Stat } from './stat.js'
import { LanguageCode } from '@tips/types.js'

export type InventoryItems = {
  [key: string]: InventoryItem
}

export type InventoryItemsLite = {
  [key: string]: InventoryItemLite
}

export type PlugSets = {
  [key: string]: PlugSet
}

export type SocketTypes = {
  [key: string]: SocketType
}

export type Stats = {
  [key: string]: Stat
}

export type Content = {
  version: string
  inventoryItem?: InventoryItems
  inventoryItemLite?: InventoryItemsLite
  plugSet?: PlugSets
  socketType?: SocketTypes
  stat?: Stats
}

export type ContentPathKeys =
  | 'DestinyInventoryItemDefinition'
  | 'DestinyInventoryItemLiteDefinition'
  | 'DestinyPlugSetDefinition'
  | 'DestinySocketTypeDefinition'

type ContentLinks = {
  [key in LanguageCode]: { [key in ContentPathKeys]: string }
}

export type Manifest = {
  Response: {
    version: string
    jsonWorldComponentContentPaths: ContentLinks
  }
}
