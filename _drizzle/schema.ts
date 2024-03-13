import { TypedObject, languageCodes, perkTypes } from '@tips/types'
import { bigint, boolean, integer, jsonb, pgEnum, pgTable, serial, text, timestamp, varchar } from 'drizzle-orm/pg-core'

import { languageCodesUnderscore } from '@tips/types'
import { relations } from 'drizzle-orm'

const hash = () => bigint('hash', { mode: 'number' }).notNull()

const hash_reference = () =>
  hash().references(() => perkSchema.hash, {
    onDelete: 'cascade',
    onUpdate: 'cascade',
  })

const username = () => varchar('username', { length: 30 }).notNull()
const username_reference = () => username().references(() => userSchema.username, { onUpdate: 'cascade' })

const time = () => timestamp('timestamp', { mode: 'date', precision: 0, withTimezone: false }).defaultNow().notNull()

export const PerkTypesEnum = pgEnum('perkType', perkTypes)

export const perkSchema = pgTable('perk', {
  hash: hash().primaryKey(),
  itemHash: bigint('itemHash', { mode: 'number' }),
  // name: in all languages
  ...TypedObject.fromEntries(languageCodes.map((lang) => [`name_${lang}`, text(`name_${lang}`).notNull()] as const)),
  // itemName: in all languages
  ...TypedObject.fromEntries(languageCodes.map((lang) => [`itemName_${lang}`, text(`itemName_${lang}`)] as const)),
  type: PerkTypesEnum('type').notNull(),
  icon: text('icon').notNull(),
  itemIcon: text('itemIcon'),
  appearsOn: jsonb('appearsOn').notNull(),
  linkedWith: jsonb('linkedWith'),
})

const langSchema = {
  id: serial('id').primaryKey(),
  description: jsonb('description').notNull(),
  username: username_reference(),
  live: boolean('live').default(false),
  ready: boolean('ready').default(false),
  timestamp: time(),
  hash: hash_reference(),
}

const enSchema = pgTable('en', langSchema)
const multiLangSchema = languageCodesUnderscore.map((lang) => {
  if (lang === 'en') return [lang, enSchema] as const

  const newLangSchema = Object.assign(langSchema, {
    enReferenceId: integer('enReferenceId')
      .notNull()
      .references(() => enSchema.id, { onDelete: 'cascade', onUpdate: 'cascade' }),
  })

  return [lang, pgTable(lang, newLangSchema)] as const
})
const multiLangSchemas = TypedObject.fromEntries(multiLangSchema)
export const { de, en, es, es_mx, fr, it, ja, ko, pl, pt_br, ru, zh_chs, zh_cht } = multiLangSchemas

export const commentSchema = pgTable('comment', {
  id: serial('id').primaryKey(),
  hash: hash_reference(),
  username: username_reference(),
  content: text('text').notNull(),
  timestamp: time(),
})

export const RolesEnum = pgEnum('role', ['user', 'admin', 'editor'])

export const userSchema = pgTable('user', {
  id: serial('id').primaryKey(),
  username: username().unique(),
  password: varchar('password', { length: 256 }).notNull(),
  salt: varchar('salt', { length: 256 }).notNull(),
  role: RolesEnum('role').notNull(),
  created: time(),
  lastLogin: time(),
})

export const perkRelations = relations(enSchema, ({ one, many }) => ({
  perks: one(perkSchema, { fields: [enSchema.hash], references: [perkSchema.hash] }),
  comments: many(commentSchema),
}))
