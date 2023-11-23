// place files you want to import through the `$lib` alias in this folder.
import Document from '@tiptap/extension-document' // required for editor to work
import Text from '@tiptap/extension-text' // required for editor to work
import History from '@tiptap/extension-history'

import Table from '@tiptap/extension-table'
import TableCell from '@tiptap/extension-table-cell'
import TableHeader from '@tiptap/extension-table-header'
import TableRow from '@tiptap/extension-table-row'

import { Bold } from './editor/buttons/bold'
import { Div } from './editor/div'
import { TextColor } from './editor/buttons/textColor'
import { Link } from './editor/buttons/link'
import { Images } from './editor/buttons/images'
import { ListItem, BulletList } from './editor/buttons/bulletList'
import { Comment } from './editor/buttons/comment'
import { TextAlign } from './editor/buttons/alignment'

import { DescriptionImport } from './editor/buttons/descriptionImport'
import { DescriptionExport } from './editor/buttons/descriptionExport'

import { SvelteCounterExtension } from './editor/extension'

export const extensions = [
  Document,
  Text,
  History,

  Table,
  TableRow,
  TableHeader,
  TableCell,

  Bold,
  Div,
  TextColor,
  Link,
  Images,
  ListItem,
  BulletList,
  Comment,
  TextAlign,

  DescriptionImport,
  DescriptionExport,

  SvelteCounterExtension,
]

import BubbleLink__SvelteComponent_ from './editor/BubbleLink.svelte'

export const BubbleLink = BubbleLink__SvelteComponent_
