import type { languages } from 'monaco-editor'
import type Monaco from 'monaco-editor'

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
    { include: '@singleLineComment' },
    { include: '@multiLineComment' },
    { include: '@variableDeclaration' },
    { include: '@variableIdentifier' },
    { include: '@link' },
    { include: '@images' },
    { include: '@textStyling' },
    { include: '@tooltip' },
    [
      /}/,
      { token: 'purple', next: '@pop' }, // {
    ],
  ],
}

const tooltip: Record<string, languages.IMonarchLanguageRule[]> = {
  tooltip: [[
    /^(\s*tooltip\s)(@safeCharacters+)(\s*{)/,
    [
      { token: 'purple' }, // tooltip
      { token: 'lightBlue' }, // name of the tooltip
      { token: 'purple', next: '@tooltip_BracketClose' }, // name of the tooltip
    ],
  ]],

  tooltip_BracketClose: [
    { include: '@singleLineComment' },
    { include: '@multiLineComment' },
    { include: '@variableDeclaration' },
    { include: '@variableIdentifier' },
    { include: '@link' },
    { include: '@images' },
    { include: '@textStyling' },
    { include: '@enhanced' },
    [
      /}/,
      { token: 'purple', next: '@pop' }, // {
    ],
  ],
}

const link: Record<string, languages.IMonarchLanguageRule[]> = {
  link: [
    [
      /(<link\s+)(.*{\s*[^\s\t]+\s*}.*\/>)/, // look for link like text
      [
        { token: 'green' }, // <link
        { token: '@rematch', next: '@link_content' },
      ],
    ],
  ],

  link_content: [
    { include: '@multiLineComment' },
    { include: '@variableIdentifier' },
    { include: '@images' },
    { include: '@textStyling' },

    [
      /\/>/, { token: 'green', next: '@pop' } // />
    ],

    [
      /{/, { token: '@rematch', next: '@urlContent' }
    ],
    [
      /}/, 'green'
    ]
  ],
  urlContent: [
    [
      /({)(\s*#.+?)(})/, [
        { token: 'green' }, // {
        { token: 'img.enhanced' }, // text inside of {}
        { token: 'green', next: '@pop' } // }
      ]
    ],
    [
      /({)(.+?)(})/, [
        { token: 'green' }, // {
        { token: 'string.link' }, // text inside of {}
        { token: 'green', next: '@pop' } // }
      ]
    ],
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

const singleLineComment: languages.IMonarchLanguageRule[] = [
  [
    /:\/\//,
    { token: '' }, // ://
  ],
  [
    /\/\/.*$/,
    { token: 'comment.line' }, // //
  ]
]

const perkImport: languages.IMonarchLanguageRule[] = [[
  /^(\s*import\s+)(\d+\s*$)/,
  [
    { token: 'purple' }, // import
    { token: 'lightBlue' }, // perk hash
  ],
]]

const variableDeclaration: Record<string, languages.IMonarchLanguageRule[]> = {
  variableDeclaration: [
    [
      /^(\s*var\s+)(@safeCharacters+)(\s*=\s*{)/,
      [
        { token: 'purple' }, // var
        { token: 'lightBlue' }, // name
        { token: 'purple', next: '@variableDeclaration_bracketClose' }, // = {
      ],
    ],

    // [
    //   /^(\s*var\s+)(@safeCharacters+)(\s*=\s*)/,
    //   [
    //     { token: 'purple' }, // var
    //     { token: 'lightBlue' }, // name
    //     { token: 'purple' }, // =
    //   ],
    // ]
  ],
  variableDeclaration_bracketClose: [
    { include: '@singleLineComment' },
    { include: '@multiLineComment' },
    { include: '@variableIdentifier' },
    { include: '@link' },
    { include: '@images' },
    { include: '@textStyling' },
    { include: '@enhanced' },
    { include: '@tooltip' },

    [
      /}/,
      { token: 'purple', next: '@pop' }, // }
    ],
  ]

}

const variableIdentifier: languages.IMonarchLanguageRule[] = [
  [
    /#@safeCharacters+/, { token: 'blue' }
  ]
]

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

const textStyling: Record<string, languages.IMonarchLanguageRule[]> = {
  textStyling: [
    [
      /<(?:pvp|pve|bold|yellow|green)\s+.+?\/>/,
      { token: '@rematch', next: '@textStyling_content' }
    ],
  ],

  textStyling_content: [
    { include: '@multiLineComment' },
    { include: '@variableIdentifier' },
    { include: '@images' },
    [
      /<(?:pvp|pve|bold|yellow|green)/,
      { token: 'green' }
    ],
    [
      /\/>/,
      { token: 'green' }
    ],
  ]
}

const enhancedNumberValues: Record<string, languages.IMonarchLanguageRule[]> = {
  enhancedNumberValues: [
    [
      /{\s*@number\s*󒱀\s*@number\s*}/,
      { token: '@rematch', next: '@enhancedNumberValues_content' }
    ],
  ],
  enhancedNumberValues_content: [
    [/}/, { token: 'img.enhanced', next: '@pop' }],
    [/{/, { token: 'img.enhanced' }],
    [/󒱀/, { token: 'img.enhanced' }],
    [/[^]/, { token: 'lightBlue' }]
  ],
}

export const tokensProvider: Monaco.languages.IMonarchLanguage = {
  // characters safe to use for identifiers
  safeCharacters: /[^<>{}#=\s]/, // /[!-'*-<>-Z\\^-~]+/,
  // used for enhanced number values
  number: /(?:[+~-]?\d+(?:\.\d+)?[x%]?\??|\?)/,

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
      { include: '@textStyling' },
      { include: '@enhancedNumberValues' }
    ],

    ...enhanced,
    ...tooltip,
    ...link,
    ...multiLineComment,

    singleLineComment,
    perkImport,
    ...variableDeclaration,
    variableIdentifier,
    images,
    ...textStyling,
    ...enhancedNumberValues
  },
}
