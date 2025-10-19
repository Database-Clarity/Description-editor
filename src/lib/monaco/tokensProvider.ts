import type { languages } from 'monaco-editor'
import type Monaco from 'monaco-editor'

const enhanced_tooltip_include = [
  { include: '@singleLineComment' },
  { include: '@multiLineComment' },
  { include: '@variableDeclaration' },
  { include: '@variableIdentifier' },
  { include: '@link' },
  { include: '@images' },
  { include: '@textModifiers' },
]

const enhanced: Record<string, languages.IMonarchLanguageRule[]> = {
  enhanced: [
    [
      /^(\s*enhanced\s*)({)/,
      [
        { token: 'purple', }, // enhanced
        { token: 'purple', next: '@enhanced_bracketClose' }, // enhanced
      ],
    ]
  ],

  enhanced_bracketClose: [
    ...enhanced_tooltip_include,
    { include: '@tooltip_blue' },
    [
      /{/,
      { token: 'purple' }, // }
    ],
    [
      /}/,
      { token: 'purple', next: '@pop' }, // {
    ],
  ],

  // Blue variant for nesting inside tooltip
  enhanced_blue: [[
    /^(\s*enhanced\s*)({)/,
    [
      { token: 'blue', }, // enhanced
      { token: 'blue', next: '@enhanced_bracketClose_blue' }, // enhanced
    ],
  ]],

  enhanced_bracketClose_blue: [
    ...enhanced_tooltip_include,

    [
      /{/,
      { token: 'blue' }, // }
    ],
    [
      /}/,
      { token: 'blue', next: '@pop' }, // {
    ],
  ]
}

const tooltip: Record<string, languages.IMonarchLanguageRule[]> = {
  tooltip: [[
    /^(\s*tooltip\s)(.+?)({)/,
    [
      { token: 'purple' }, // tooltip
      { token: 'lightBlue' }, // name of the tooltip
      { token: 'purple', next: '@tooltip_BracketClose' }, // name of the tooltip
    ],
  ]],

  tooltip_BracketClose: [
    ...enhanced_tooltip_include,
    { include: '@enhanced_blue' },

    [
      /{/,
      { token: 'purple' }, // }
    ],
    [
      /}/,
      { token: 'purple', next: '@pop' }, // {
    ],
  ],

  // Blue variant for nesting inside enhanced
  tooltip_blue: [[
    /^(\s*tooltip\s)(.+?)({)/,
    [
      { token: 'blue' }, // tooltip
      { token: 'lightBlue' }, // name of the tooltip
      { token: 'blue', next: '@tooltip_BracketClose_blue' }, // name of the tooltip
    ],
  ]],

  tooltip_BracketClose_blue: [
    ...enhanced_tooltip_include,

    [
      /{/,
      { token: 'blue' }, // }
    ],
    [
      /}/,
      { token: 'blue', next: '@pop' }, // {
    ],
  ]
}

const link: Record<string, languages.IMonarchLanguageRule[]> = {
  // link: [
  //   [
  //     /(\[)((?:[^\]]|\\.)*\]\((?:[^)]|\\.)*\))/, // look for link like text
  //     [
  //       { token: '' }, // [
  //       { token: '@rematch', next: '@link_content' },
  //     ],
  //   ],
  // ],

  link: [
    [
      /(<link\s+)(.+{.+}.*\/>)/, // look for link like text
      [
        { token: 'green' }, // <link
        { token: '@rematch', next: '@link_content' },
      ],
    ],
  ],

  link_content: [
    { include: '@singleLineComment' },
    { include: '@multiLineComment' },
    { include: '@variableIdentifier' },
    { include: '@images' },

    [
      /\/>/, { token: 'green', next: '@pop' } // />
    ],

    [
      /{/, { token: '@rematch', next: '@urlContent' }
    ],
    [
      /}/, 'green'
    ]

    // [
    //   /(\]\()((?!\s*[$#])[^)]*)(\))/,
    //   [
    //     { token: '' }, // ](
    //     { token: 'string.link' }, // url
    //     { token: '', next: '@pop' }, // )
    //   ],
    // ],

    // [/\]\(/, ''],
    // [/\)/, { token: '', next: '@pop' }],

    // [/[^]/, 'string'],
  ],
  urlContent: [
    [
      /({)(.+?)(})/, [
        { token: 'green' }, // url
        { token: 'string.link' }, // url
        { token: 'green', next: '@pop' } // url
      ]
    ],
    // [
    //   /\)/, { token: '', next: '@pop' } // )
    // ],
  ],
}

const multiLineComment: Record<string, languages.IMonarchLanguageRule[]> = {
  multiLineComment: [
    [
      /\/\*/,
      { token: 'comment.block', next: '@multiLineComment_end' }, // /*
    ],
  ],

  multiLineComment_end: [
    [/\*\//, { token: 'comment.block', next: '@pop' }], // */
    [/[^]/, { token: 'comment.block' }], // text inside of multi line comment /*  */
  ],
}

const singleLineComment: languages.IMonarchLanguageRule[] = [[
  /(?:[^:]\/\/.*$|^\/\/.*$)/,
  { token: 'comment.line' }, // //
]]

const perkImport: languages.IMonarchLanguageRule[] = [[
  /^(\s*import\s+)(\d+\s*$)/,
  [
    { token: 'purple' }, // import
    { token: 'lightBlue' }, // perk hash
  ],
]]

const variableDeclaration: languages.IMonarchLanguageRule[] = [[
  /^(\s*var\s+)(@safeCharacters+)(\s+=\s+)/,
  [
    { token: 'purple' }, // var
    { token: 'lightBlue' }, // name
    { token: 'purple' }, // =
  ],
]]

const variableIdentifier: languages.IMonarchLanguageRule[] = [[
  /#@safeCharacters+/, { token: 'img.enhanced' }
]]

const images: languages.IMonarchLanguageRule[] = [
  // elements
  [/󒰀/, 'img.arch'],
  [/󒰁/, 'img.solar'],
  [/󒰂/, 'img.void'],
  [/󒰃/, 'img.stasis'],
  [/󒰄/, 'img.strand'],

  // breakers
  [/󒰐/, ''],
  [/󒰑/, ''],
  [/󒰒/, ''],

  // ammo
  [/󒰠/, ''], // primary
  [/󒰡/, 'img.special'],
  [/󒰢/, 'img.heavy'],

  // classes
  [/󒰱/, 'img.hunter'],
  [/󒰲/, 'img.titan'],
  [/󒰰/, 'img.warlock'],

  // enhanced
  [/󒱀/, 'img.enhanced'],
]

const textModifiers: languages.IMonarchLanguageRule[] = [
  [
    /<(?:pvp|pve|bold|yellow|green)\s+.+?>/,
    ''
  ],
]

export const tokensProvider: Monaco.languages.IMonarchLanguage = {
  // characters what won't break my text formatting used for var names
  safeCharacters: /[^[\](){}#=\s]/, // /[!-'*-<>-Z\\^-~]+/,

  tokenizer: {
    root: [
      { include: '@enhanced' },
      { include: '@tooltip' },
      { include: '@link' },
      { include: '@multiLineComment' },
      { include: '@singleLineComment' },

      { include: '@perkImport' },
      { include: '@variableDeclaration' },
      { include: '@variableIdentifier' },
      { include: '@images' },
      { include: '@textModifiers' },

      [/./, 'string'],
    ],
    ...enhanced,
    ...tooltip,
    ...link,
    ...multiLineComment,

    singleLineComment,
    perkImport,
    variableDeclaration,
    variableIdentifier,
    images,
    textModifiers,
  },
}
