import { IntermediatePerk } from '@icemourne/description-converter'

const specialWrappers = ['green', 'blue', 'purple', 'yellow', 'center', 'bold', 'pve', 'pvp']

export const wrappers = {
   imageAdding: [
      'kinetic',
      'stasis',
      'arc',
      'solar',
      'void',
      'strand',

      'primary',
      'special',
      'heavy',

      'barrier',
      'overload',
      'unstoppable',

      'warlock',
      'hunter',
      'titan'
   ],
   complicated: ['link', 'title', 'formula'],
   lineEffecting: [...specialWrappers, 'breakSpaces', 'background'],
   textEffecting: specialWrappers
}

export const selfContainedArr = [...wrappers.imageAdding, ...wrappers.lineEffecting]

export const defaultPerk: IntermediatePerk = {
   hash: 0,
   name: 'Default perk',
   type: 'none',
   lastUpload: 0,
   uploadedBy: '',
   editor: {
      en: {
         main: '',
         secondary: ''
      }
   },
   updateTracker: {
      stats: {
         lastUpdate: 0,
         updatedBy: ''
      },
      descriptions: {
         en: {
            lastUpdate: 0,
            updatedBy: ''
         }
      }
   },
   uploadToLive: false,
   inLiveDatabase: false,
}

export const defaultDescription = `
Images you can use in descriptions
<kinetic/> <arc/> <void/> <solar/> <stasis/> <strand/>
<primary/> <special/> <heavy/>
<warlock/> <hunter/> <titan/>
Text coloring
<blue text /> <green text /> <purple text /> <yellow text />
<pvp text /> <pve text />

The same can be done to lines of text <green/>

You probably noticed having multiple spaces in the editor
              doesn't mean it will be the same in description
              you can change that with <breakSpaces/>

// This is comment content after // will not appear in the description

// ----------------------------------------------------------
// weapon type explanation
// they work like if else in programming

// if auto rifle
< weapon type ( AR ) >
    Apply this text
// else if glaive
< ( Glaive ) >
    Apply this text
// else
< ( other ) >
    Apply this text to all weapons not specified in this block
<$$>
// also, you can preview how it would look on x weapon by selecting the weapon in the weapon popup under the weapons name
// ----------------------------------------------------------
If there is something you want just ask
This is not everything you can do btw

To see the full list press CTRL + SPACE
Also, CTRL + F is a thing and can be used to find and replace
Also also editor has other stuff to see them press F1
`.trim()
