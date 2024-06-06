import { BulletList, ListItem } from './editor/extensions/bulletList'

import { Bold } from './editor/extensions/bold'
import { Comment } from './editor/extensions/comment'
import { DescriptionImportExtension } from './editor/test/descriptionImport'
import { Div } from '$lib/editor/extensions/div'
import Document from '@tiptap/extension-document'
import Dropcursor from '@tiptap/extension-dropcursor'
import { Enhanced } from './editor/extensions/enhanced'
import Gapcursor from '@tiptap/extension-gapcursor'
import History from '@tiptap/extension-history'
import { Images } from './editor/extensions/images'
import { Link } from './editor/extensions/link'
import Table from '@tiptap/extension-table'
import TableCell from '@tiptap/extension-table-cell'
import TableHeader from '@tiptap/extension-table-header'
import TableRow from '@tiptap/extension-table-row'
import Text from '@tiptap/extension-text'
import { TextAlign } from './editor/extensions/alignment'
import { TextColor } from './editor/extensions/textColor'
import { Highlight } from './editor/extensions/highlight'

// import HardBreak from '@tiptap/extension-hard-break'

export const extensions = [
  // Non optional extensions required for editor to work properly
  Document,
  Text,
  History,

  // Editor content extensions
  Div,

  // Buttons, Dropdowns, etc.
  TextAlign,
  Bold,
  ListItem,
  BulletList,
  Comment,
  TextColor,
  Enhanced,
  Images,
  Link,
  Highlight,
  Dropcursor.configure({
    width: 2,
    color: '#00cc11',
  }),
  Gapcursor,

  // HardBreak,

  Table,
  TableRow,
  TableHeader,
  TableCell,

  DescriptionImportExtension,
]
