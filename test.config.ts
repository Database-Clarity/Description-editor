import { Style } from "./vite.config";

const EditorButton: Style = [
  {
    "type": "Rule",
    "prelude": {
      "type": "SelectorList",
      "start": 1077,
      "end": 1103,
      "children": [
        {
          "type": "Selector",
          "start": 1077,
          "end": 1103,
          "children": [
            {
              "type": "PseudoClassSelector",
              "name": "component",
              "args": {
                "type": "SelectorList",
                "start": 1088,
                "end": 1102,
                "children": [
                  {
                    "type": "ComplexSelector",
                    "start": 1088,
                    "end": 1102,
                    "children": [
                      {
                        "type": "RelativeSelector",
                        "combinator": null,
                        "selectors": [
                          {
                            "type": "TypeSelector",
                            "name": "Button",
                            "start": 1088,
                            "end": 1094
                          },
                          {
                            "type": "ClassSelector",
                            "name": "rounded",
                            "start": 1094,
                            "end": 1102
                          }
                        ],
                        "start": 1088,
                        "end": 1102,
                        "metadata": {
                          "is_global": false,
                          "is_global_like": false,
                          "scoped": false
                        }
                      }
                    ],
                    "metadata": {
                      "rule": null,
                      "used": false
                    }
                  }
                ]
              },
              "start": 1077,
              "end": 1103
            }
          ]
        }
      ]
    },
    "block": {
      "type": "Block",
      "start": 1104,
      "end": 1157,
      "children": [
        {
          "type": "Declaration",
          "start": 1110,
          "end": 1124,
          "property": "height",
          "value": "1.5rem"
        },
        {
          "type": "Declaration",
          "start": 1130,
          "end": 1152,
          "property": "border-radius",
          "value": "0.25rem"
        }
      ]
    },
    "start": 1077,
    "end": 1157
  },
  {
    "type": "Rule",
    "prelude": {
      "type": "SelectorList",
      "start": 1161,
      "end": 1184,
      "children": [
        {
          "type": "Selector",
          "start": 1161,
          "end": 1184,
          "children": [
            {
              "type": "PseudoClassSelector",
              "name": "component",
              "args": {
                "type": "SelectorList",
                "start": 1172,
                "end": 1183,
                "children": [
                  {
                    "type": "ComplexSelector",
                    "start": 1172,
                    "end": 1183,
                    "children": [
                      {
                        "type": "RelativeSelector",
                        "combinator": null,
                        "selectors": [
                          {
                            "type": "TypeSelector",
                            "name": "Button",
                            "start": 1172,
                            "end": 1178
                          },
                          {
                            "type": "ClassSelector",
                            "name": "test",
                            "start": 1178,
                            "end": 1183
                          }
                        ],
                        "start": 1172,
                        "end": 1183,
                        "metadata": {
                          "is_global": false,
                          "is_global_like": false,
                          "scoped": false
                        }
                      }
                    ],
                    "metadata": {
                      "rule": null,
                      "used": false
                    }
                  }
                ]
              },
              "start": 1161,
              "end": 1184
            }
          ]
        }
      ]
    },
    "block": {
      "type": "Block",
      "start": 1185,
      "end": 1238,
      "children": [
        {
          "type": "Declaration",
          "start": 1191,
          "end": 1205,
          "property": "height",
          "value": "1.5rem"
        },
        {
          "type": "Declaration",
          "start": 1211,
          "end": 1233,
          "property": "border-radius",
          "value": "0.25rem"
        }
      ]
    },
    "start": 1161,
    "end": 1238
  },
  {
    "type": "Rule",
    "prelude": {
      "type": "SelectorList",
      "start": 1242,
      "end": 1251,
      "children": [
        {
          "type": "Selector",
          "start": 1242,
          "end": 1251,
          "children": [
            {
              "type": "ClassSelector",
              "name": "rounded-",
              "start": 1242,
              "end": 1251
            }
          ]
        }
      ]
    },
    "block": {
      "type": "Block",
      "start": 1252,
      "end": 1280,
      "children": [
        {
          "type": "Declaration",
          "start": 1258,
          "end": 1275,
          "property": "display",
          "value": "contents"
        }
      ]
    },
    "start": 1242,
    "end": 1280
  },
]

const Button: Style = [
  {
    "type": "Rule",
    "prelude": {
      "type": "SelectorList",
      "start": 428,
      "end": 452,
      "children": [
        {
          "type": "Selector",
          "start": 428,
          "end": 452,
          "children": [
            {
              "type": "ClassSelector",
              "name": "editor-button",
              "start": 428,
              "end": 442
            },
            {
              "type": "PseudoClassSelector",
              "name": "has",
              "args": {
                "type": "SelectorList",
                "start": 447,
                "end": 451,
                "children": [
                  {
                    "type": "ComplexSelector",
                    "start": 447,
                    "end": 451,
                    "children": [
                      {
                        "type": "RelativeSelector",
                        "combinator": null,
                        "selectors": [
                          {
                            "type": "TypeSelector",
                            "name": "span",
                            "start": 447,
                            "end": 451
                          }
                        ],
                        "start": 447,
                        "end": 451,
                        "metadata": {
                          "is_global": false,
                          "is_global_like": false,
                          "scoped": false
                        }
                      }
                    ],
                    "metadata": {
                      "rule": null,
                      "used": false
                    }
                  }
                ]
              },
              "start": 442,
              "end": 452
            }
          ]
        }
      ]
    },
    "block": {
      "type": "Block",
      "start": 453,
      "end": 623,
      "children": [
        {
          "type": "Declaration",
          "start": 483,
          "end": 496,
          "property": "display",
          "value": "grid"
        },
        {
          "type": "Declaration",
          "start": 500,
          "end": 530,
          "property": "grid-template-columns",
          "value": "1fr 3fr"
        },
        {
          "type": "Declaration",
          "start": 534,
          "end": 555,
          "property": "justify-items",
          "value": "center"
        },
        {
          "type": "Declaration",
          "start": 559,
          "end": 578,
          "property": "align-items",
          "value": "center"
        },
        {
          "type": "Declaration",
          "start": 607,
          "end": 620,
          "property": "width",
          "value": "6.5rem"
        }
      ]
    },
    "start": 428,
    "end": 623
  },
  {
    "type": "Rule",
    "prelude": {
      "type": "SelectorList",
      "start": 625,
      "end": 655,
      "children": [
        {
          "type": "Selector",
          "start": 625,
          "end": 655,
          "children": [
            {
              "type": "ClassSelector",
              "name": "editor-button",
              "start": 625,
              "end": 639
            },
            {
              "type": "PseudoClassSelector",
              "name": "not",
              "args": {
                "type": "SelectorList",
                "start": 644,
                "end": 654,
                "children": [
                  {
                    "type": "ComplexSelector",
                    "start": 644,
                    "end": 654,
                    "children": [
                      {
                        "type": "RelativeSelector",
                        "combinator": null,
                        "selectors": [
                          {
                            "type": "PseudoClassSelector",
                            "name": "has",
                            "args": {
                              "type": "SelectorList",
                              "start": 649,
                              "end": 653,
                              "children": [
                                {
                                  "type": "ComplexSelector",
                                  "start": 649,
                                  "end": 653,
                                  "children": [
                                    {
                                      "type": "RelativeSelector",
                                      "combinator": null,
                                      "selectors": [
                                        {
                                          "type": "TypeSelector",
                                          "name": "span",
                                          "start": 649,
                                          "end": 653
                                        }
                                      ],
                                      "start": 649,
                                      "end": 653,
                                      "metadata": {
                                        "is_global": false,
                                        "is_global_like": false,
                                        "scoped": false
                                      }
                                    }
                                  ],
                                  "metadata": {
                                    "rule": null,
                                    "used": false
                                  }
                                }
                              ]
                            },
                            "start": 644,
                            "end": 654
                          }
                        ],
                        "start": 644,
                        "end": 654,
                        "metadata": {
                          "is_global": false,
                          "is_global_like": false,
                          "scoped": false
                        }
                      }
                    ],
                    "metadata": {
                      "rule": null,
                      "used": false
                    }
                  }
                ]
              },
              "start": 639,
              "end": 655
            }
          ]
        }
      ]
    },
    "block": {
      "type": "Block",
      "start": 656,
      "end": 794,
      "children": [
        {
          "type": "Declaration",
          "start": 686,
          "end": 699,
          "property": "display",
          "value": "flex"
        },
        {
          "type": "Declaration",
          "start": 703,
          "end": 726,
          "property": "justify-content",
          "value": "center"
        },
        {
          "type": "Declaration",
          "start": 730,
          "end": 749,
          "property": "align-items",
          "value": "center"
        },
        {
          "type": "Declaration",
          "start": 778,
          "end": 791,
          "property": "width",
          "value": "1.5rem"
        }
      ]
    },
    "start": 625,
    "end": 794
  },
  {
    "type": "Rule",
    "prelude": {
      "type": "SelectorList",
      "start": 796,
      "end": 810,
      "children": [
        {
          "type": "Selector",
          "start": 796,
          "end": 810,
          "children": [
            {
              "type": "ClassSelector",
              "name": "editor-button",
              "start": 796,
              "end": 810
            }
          ]
        }
      ]
    },
    "block": {
      "type": "Block",
      "start": 811,
      "end": 1374,
      "children": [
        {
          "type": "Declaration",
          "start": 839,
          "end": 853,
          "property": "height",
          "value": "1.5rem"
        },
        {
          "type": "Declaration",
          "start": 884,
          "end": 906,
          "property": "border-radius",
          "value": "0.25rem"
        },
        {
          "type": "Declaration",
          "start": 910,
          "end": 943,
          "property": "background-color",
          "value": "hsl(0, 0%, 15%)"
        },
        {
          "type": "Atrule",
          "start": 948,
          "end": 1029,
          "name": "media",
          "prelude": "(prefers-color-scheme: light)",
          "block": {
            "type": "Block",
            "start": 985,
            "end": 1029,
            "children": [
              {
                "type": "Declaration",
                "start": 991,
                "end": 1024,
                "property": "background-color",
                "value": "hsl(0, 0%, 85%)"
              }
            ]
          }
        },
        {
          "type": "Rule",
          "prelude": {
            "type": "SelectorList",
            "start": 1053,
            "end": 1060,
            "children": [
              {
                "type": "Selector",
                "start": 1053,
                "end": 1060,
                "children": [
                  {
                    "type": "NestingSelector",
                    "name": "&",
                    "start": 1053,
                    "end": 1054
                  },
                  {
                    "type": "PseudoClassSelector",
                    "name": "hover",
                    "args": null,
                    "start": 1054,
                    "end": 1060
                  }
                ]
              }
            ]
          },
          "block": {
            "type": "Block",
            "start": 1061,
            "end": 1196,
            "children": [
              {
                "type": "Declaration",
                "start": 1067,
                "end": 1100,
                "property": "background-color",
                "value": "hsl(0, 0%, 25%)"
              },
              {
                "type": "Atrule",
                "start": 1107,
                "end": 1192,
                "name": "media",
                "prelude": "(prefers-color-scheme: light)",
                "block": {
                  "type": "Block",
                  "start": 1144,
                  "end": 1192,
                  "children": [
                    {
                      "type": "Declaration",
                      "start": 1152,
                      "end": 1185,
                      "property": "background-color",
                      "value": "hsl(0, 0%, 75%)"
                    }
                  ]
                }
              }
            ]
          },
          "start": 1053,
          "end": 1196
        },
        {
          "type": "Rule",
          "prelude": {
            "type": "SelectorList",
            "start": 1221,
            "end": 1229,
            "children": [
              {
                "type": "Selector",
                "start": 1221,
                "end": 1229,
                "children": [
                  {
                    "type": "NestingSelector",
                    "name": "&",
                    "start": 1221,
                    "end": 1222
                  },
                  {
                    "type": "PseudoClassSelector",
                    "name": "active",
                    "args": null,
                    "start": 1222,
                    "end": 1229
                  }
                ]
              }
            ]
          },
          "block": {
            "type": "Block",
            "start": 1230,
            "end": 1372,
            "children": [
              {
                "type": "Declaration",
                "start": 1236,
                "end": 1272,
                "property": "background-color",
                "value": "hsl(120, 80%, 50%)"
              },
              {
                "type": "Atrule",
                "start": 1279,
                "end": 1368,
                "name": "media",
                "prelude": "(prefers-color-scheme: light)",
                "block": {
                  "type": "Block",
                  "start": 1316,
                  "end": 1368,
                  "children": [
                    {
                      "type": "Declaration",
                      "start": 1324,
                      "end": 1361,
                      "property": "background-color",
                      "value": "hsl(120, 100%, 25%)"
                    }
                  ]
                }
              }
            ]
          },
          "start": 1221,
          "end": 1372
        }
      ]
    },
    "start": 796,
    "end": 1374
  },
  {
    "type": "Rule",
    "prelude": {
      "type": "SelectorList",
      "start": 1375,
      "end": 1405,
      "children": [
        {
          "type": "Selector",
          "start": 1375,
          "end": 1405,
          "children": [
            {
              "type": "PseudoClassSelector",
              "name": "global",
              "args": {
                "type": "SelectorList",
                "start": 1383,
                "end": 1404,
                "children": [
                  {
                    "type": "ComplexSelector",
                    "start": 1383,
                    "end": 1404,
                    "children": [
                      {
                        "type": "RelativeSelector",
                        "combinator": null,
                        "selectors": [
                          {
                            "type": "ClassSelector",
                            "name": "editor-button",
                            "start": 1383,
                            "end": 1397
                          }
                        ],
                        "start": 1383,
                        "end": 1397,
                        "metadata": {
                          "is_global": false,
                          "is_global_like": false,
                          "scoped": false
                        }
                      },
                      {
                        "type": "RelativeSelector",
                        "combinator": {
                          "type": "Combinator",
                          "name": ">",
                          "start": 1398,
                          "end": 1399
                        },
                        "selectors": [
                          {
                            "type": "TypeSelector",
                            "name": "span",
                            "start": 1400,
                            "end": 1404
                          }
                        ],
                        "start": 1398,
                        "end": 1404,
                        "metadata": {
                          "is_global": false,
                          "is_global_like": false,
                          "scoped": false
                        }
                      }
                    ],
                    "metadata": {
                      "rule": null,
                      "used": false
                    }
                  }
                ]
              },
              "start": 1375,
              "end": 1405
            }
          ]
        }
      ]
    },
    "block": {
      "type": "Block",
      "start": 1406,
      "end": 1671,
      "children": [
        {
          "type": "Declaration",
          "start": 1442,
          "end": 1464,
          "property": "justify-self",
          "value": "baseline"
        },
        {
          "type": "Declaration",
          "start": 1501,
          "end": 1518,
          "property": "text-wrap",
          "value": "nowrap"
        },
        {
          "type": "Declaration",
          "start": 1522,
          "end": 1548,
          "property": "text-transform",
          "value": "capitalize"
        },
        {
          "type": "Declaration",
          "start": 1552,
          "end": 1575,
          "property": "text-overflow",
          "value": "ellipsis"
        },
        {
          "type": "Declaration",
          "start": 1579,
          "end": 1596,
          "property": "text-align",
          "value": "start"
        },
        {
          "type": "Declaration",
          "start": 1600,
          "end": 1619,
          "property": "white-space",
          "value": "nowrap"
        },
        {
          "type": "Declaration",
          "start": 1652,
          "end": 1668,
          "property": "overflow",
          "value": "hidden"
        }
      ]
    },
    "start": 1375,
    "end": 1671
  },
  {
    "type": "Rule",
    "prelude": {
      "type": "SelectorList",
      "start": 1673,
      "end": 1698,
      "children": [
        {
          "type": "Selector",
          "start": 1673,
          "end": 1698,
          "children": [
            {
              "type": "PseudoClassSelector",
              "name": "global",
              "args": {
                "type": "SelectorList",
                "start": 1681,
                "end": 1697,
                "children": [
                  {
                    "type": "ComplexSelector",
                    "start": 1681,
                    "end": 1697,
                    "children": [
                      {
                        "type": "RelativeSelector",
                        "combinator": null,
                        "selectors": [
                          {
                            "type": "ClassSelector",
                            "name": "wrapper",
                            "start": 1681,
                            "end": 1689
                          }
                        ],
                        "start": 1681,
                        "end": 1689,
                        "metadata": {
                          "is_global": false,
                          "is_global_like": false,
                          "scoped": false
                        }
                      },
                      {
                        "type": "RelativeSelector",
                        "combinator": {
                          "type": "Combinator",
                          "name": ">",
                          "start": 1690,
                          "end": 1691
                        },
                        "selectors": [
                          {
                            "type": "ClassSelector",
                            "name": "icon",
                            "start": 1692,
                            "end": 1697
                          }
                        ],
                        "start": 1690,
                        "end": 1697,
                        "metadata": {
                          "is_global": false,
                          "is_global_like": false,
                          "scoped": false
                        }
                      }
                    ],
                    "metadata": {
                      "rule": null,
                      "used": false
                    }
                  }
                ]
              },
              "start": 1673,
              "end": 1698
            }
          ]
        }
      ]
    },
    "block": {
      "type": "Block",
      "start": 1699,
      "end": 1835,
      "children": [
        {
          "type": "Declaration",
          "start": 1703,
          "end": 1721,
          "property": "position",
          "value": "absolute"
        },
        {
          "type": "Declaration",
          "start": 1725,
          "end": 1733,
          "property": "top",
          "value": "50%"
        },
        {
          "type": "Declaration",
          "start": 1737,
          "end": 1746,
          "property": "left",
          "value": "50%"
        },
        {
          "type": "Declaration",
          "start": 1750,
          "end": 1782,
          "property": "transform",
          "value": "translate(-50%, -50%)"
        },
        {
          "type": "Declaration",
          "start": 1786,
          "end": 1796,
          "property": "width",
          "value": "50%"
        },
        {
          "type": "Declaration",
          "start": 1800,
          "end": 1811,
          "property": "height",
          "value": "50%"
        },
        {
          "type": "Declaration",
          "start": 1815,
          "end": 1832,
          "property": "object-fit",
          "value": "cover"
        }
      ]
    },
    "start": 1673,
    "end": 1835
  }
]

const Page: Style = [
  {
    "type": "Rule",
    "prelude": {
      "type": "SelectorList",
      "start": 5007,
      "end": 5018,
      "children": [
        {
          "type": "Selector",
          "start": 5007,
          "end": 5018,
          "children": [
            {
              "type": "ClassSelector",
              "name": "bubbleMenu",
              "start": 5007,
              "end": 5018
            }
          ]
        }
      ]
    },
    "block": {
      "type": "Block",
      "start": 5019,
      "end": 5190,
      "children": [
        {
          "type": "Declaration",
          "start": 5023,
          "end": 5036,
          "property": "display",
          "value": "flex"
        },
        {
          "type": "Declaration",
          "start": 5040,
          "end": 5051,
          "property": "gap",
          "value": "0.3rem"
        },
        {
          "type": "Declaration",
          "start": 5055,
          "end": 5070,
          "property": "padding",
          "value": "0.3rem"
        },
        {
          "type": "Declaration",
          "start": 5074,
          "end": 5113,
          "property": "background-color",
          "value": "hsla(0, 0%, 30%, 0.7)"
        },
        {
          "type": "Declaration",
          "start": 5117,
          "end": 5138,
          "property": "border-radius",
          "value": "0.3rem"
        },
        {
          "type": "Declaration",
          "start": 5142,
          "end": 5187,
          "property": "box-shadow",
          "value": "0 0 0.3rem 0 hsla(0, 0%, 0%, 0.2)"
        }
      ]
    },
    "start": 5007,
    "end": 5190
  },
  {
    "type": "Rule",
    "prelude": {
      "type": "SelectorList",
      "start": 5192,
      "end": 5208,
      "children": [
        {
          "type": "Selector",
          "start": 5192,
          "end": 5208,
          "children": [
            {
              "type": "ClassSelector",
              "name": "editorContainer",
              "start": 5192,
              "end": 5208
            }
          ]
        }
      ]
    },
    "block": {
      "type": "Block",
      "start": 5209,
      "end": 5365,
      "children": [
        {
          "type": "Declaration",
          "start": 5213,
          "end": 5230,
          "property": "max-width",
          "value": "1192px"
        },
        {
          "type": "Rule",
          "prelude": {
            "type": "SelectorList",
            "start": 5234,
            "end": 5246,
            "children": [
              {
                "type": "Selector",
                "start": 5234,
                "end": 5246,
                "children": [
                  {
                    "type": "ClassSelector",
                    "name": "firstEditor",
                    "start": 5234,
                    "end": 5246
                  }
                ]
              }
            ]
          },
          "block": {
            "type": "Block",
            "start": 5247,
            "end": 5270,
            "children": [
              {
                "type": "Declaration",
                "start": 5253,
                "end": 5265,
                "property": "height",
                "value": "50vh"
              }
            ]
          },
          "start": 5234,
          "end": 5270
        },
        {
          "type": "Rule",
          "prelude": {
            "type": "SelectorList",
            "start": 5273,
            "end": 5286,
            "children": [
              {
                "type": "Selector",
                "start": 5273,
                "end": 5286,
                "children": [
                  {
                    "type": "ClassSelector",
                    "name": "secondEditor",
                    "start": 5273,
                    "end": 5286
                  }
                ]
              }
            ]
          },
          "block": {
            "type": "Block",
            "start": 5287,
            "end": 5363,
            "children": [
              {
                "type": "Declaration",
                "start": 5293,
                "end": 5305,
                "property": "height",
                "value": "40vh"
              },
              {
                "type": "Declaration",
                "start": 5311,
                "end": 5358,
                "property": "border-top",
                "value": "0.3rem solid hsla(0, 0%, 100%, 0.2)"
              }
            ]
          },
          "start": 5273,
          "end": 5363
        }
      ]
    },
    "start": 5192,
    "end": 5365
  },
  {
    "type": "Atrule",
    "start": 5367,
    "end": 5450,
    "name": "font-face",
    "prelude": "",
    "block": {
      "type": "Block",
      "start": 5378,
      "end": 5450,
      "children": [
        {
          "type": "Declaration",
          "start": 5382,
          "end": 5411,
          "property": "font-family",
          "value": "D2 Clarity fonts"
        },
        {
          "type": "Declaration",
          "start": 5415,
          "end": 5447,
          "property": "src",
          "value": "url(/D2-Clarity-fonts.woff)"
        }
      ]
    }
  }
]

const Search: Style = [
  {
    "type": "Rule",
    "prelude": {
      "type": "SelectorList",
      "start": 2532,
      "end": 2548,
      "children": [
        {
          "type": "Selector",
          "start": 2532,
          "end": 2548,
          "children": [
            {
              "type": "TypeSelector",
              "name": "dialog",
              "start": 2532,
              "end": 2538
            },
            {
              "type": "PseudoElementSelector",
              "name": "backdrop",
              "start": 2538,
              "end": 2548
            }
          ]
        }
      ]
    },
    "block": {
      "type": "Block",
      "start": 2549,
      "end": 2594,
      "children": [
        {
          "type": "Declaration",
          "start": 2554,
          "end": 2590,
          "property": "background-color",
          "value": "rgba(0, 0, 0, 0.5)"
        }
      ]
    },
    "start": 2532,
    "end": 2594
  },
  {
    "type": "Rule",
    "prelude": {
      "type": "SelectorList",
      "start": 2596,
      "end": 2609,
      "children": [
        {
          "type": "Selector",
          "start": 2596,
          "end": 2609,
          "children": [
            {
              "type": "ClassSelector",
              "name": "modalContent",
              "start": 2596,
              "end": 2609
            }
          ]
        }
      ]
    },
    "block": {
      "type": "Block",
      "start": 2610,
      "end": 2709,
      "children": [
        {
          "type": "Declaration",
          "start": 2615,
          "end": 2628,
          "property": "display",
          "value": "flex"
        },
        {
          "type": "Declaration",
          "start": 2633,
          "end": 2655,
          "property": "flex-direction",
          "value": "column"
        },
        {
          "type": "Declaration",
          "start": 2660,
          "end": 2669,
          "property": "gap",
          "value": "1rem"
        },
        {
          "type": "Declaration",
          "start": 2674,
          "end": 2686,
          "property": "height",
          "value": "91vh"
        },
        {
          "type": "Declaration",
          "start": 2691,
          "end": 2705,
          "property": "margin",
          "value": "0.3rem"
        }
      ]
    },
    "start": 2596,
    "end": 2709
  },
  {
    "type": "Rule",
    "prelude": {
      "type": "SelectorList",
      "start": 2711,
      "end": 2724,
      "children": [
        {
          "type": "Selector",
          "start": 2711,
          "end": 2724,
          "children": [
            {
              "type": "ClassSelector",
              "name": "groupOptions",
              "start": 2711,
              "end": 2724
            }
          ]
        }
      ]
    },
    "block": {
      "type": "Block",
      "start": 2725,
      "end": 2796,
      "children": [
        {
          "type": "Declaration",
          "start": 2730,
          "end": 2747,
          "property": "margin-left",
          "value": "1rem"
        },
        {
          "type": "Declaration",
          "start": 2752,
          "end": 2765,
          "property": "display",
          "value": "flex"
        },
        {
          "type": "Declaration",
          "start": 2770,
          "end": 2792,
          "property": "flex-direction",
          "value": "column"
        }
      ]
    },
    "start": 2711,
    "end": 2796
  },
  {
    "type": "Rule",
    "prelude": {
      "type": "SelectorList",
      "start": 2800,
      "end": 2809,
      "children": [
        {
          "type": "Selector",
          "start": 2800,
          "end": 2809,
          "children": [
            {
              "type": "ClassSelector",
              "name": "perkList",
              "start": 2800,
              "end": 2809
            }
          ]
        }
      ]
    },
    "block": {
      "type": "Block",
      "start": 2810,
      "end": 2882,
      "children": [
        {
          "type": "Declaration",
          "start": 2815,
          "end": 2828,
          "property": "display",
          "value": "flex"
        },
        {
          "type": "Declaration",
          "start": 2833,
          "end": 2855,
          "property": "flex-direction",
          "value": "column"
        },
        {
          "type": "Declaration",
          "start": 2860,
          "end": 2878,
          "property": "overflow-y",
          "value": "scroll"
        }
      ]
    },
    "start": 2800,
    "end": 2882
  }
]

const DropDown: Style = [
  {
    "type": "Rule",
    "prelude": {
      "type": "SelectorList",
      "start": 678,
      "end": 687,
      "children": [
        {
          "type": "Selector",
          "start": 678,
          "end": 687,
          "children": [
            {
              "type": "ClassSelector",
              "name": "dropDown",
              "start": 678,
              "end": 687
            }
          ]
        }
      ]
    },
    "block": {
      "type": "Block",
      "start": 688,
      "end": 772,
      "children": [
        {
          "type": "Declaration",
          "start": 692,
          "end": 710,
          "property": "position",
          "value": "absolute"
        },
        {
          "type": "Declaration",
          "start": 714,
          "end": 726,
          "property": "z-index",
          "value": "100"
        },
        {
          "type": "Declaration",
          "start": 730,
          "end": 743,
          "property": "display",
          "value": "flex"
        },
        {
          "type": "Declaration",
          "start": 747,
          "end": 769,
          "property": "flex-direction",
          "value": "column"
        }
      ]
    },
    "start": 678,
    "end": 772
  },
  {
    "type": "Rule",
    "prelude": {
      "type": "SelectorList",
      "start": 773,
      "end": 797,
      "children": [
        {
          "type": "Selector",
          "start": 773,
          "end": 797,
          "children": [
            {
              "type": "PseudoClassSelector",
              "name": "global",
              "args": {
                "type": "SelectorList",
                "start": 781,
                "end": 786,
                "children": [
                  {
                    "type": "ComplexSelector",
                    "start": 781,
                    "end": 786,
                    "children": [
                      {
                        "type": "RelativeSelector",
                        "combinator": null,
                        "selectors": [
                          {
                            "type": "ClassSelector",
                            "name": "dark",
                            "start": 781,
                            "end": 786
                          }
                        ],
                        "start": 781,
                        "end": 786,
                        "metadata": {
                          "is_global": false,
                          "is_global_like": false,
                          "scoped": false
                        }
                      }
                    ],
                    "metadata": {
                      "rule": null,
                      "used": false
                    }
                  }
                ]
              },
              "start": 773,
              "end": 787
            },
            {
              "type": "Combinator",
              "name": " ",
              "start": 787,
              "end": 788
            },
            {
              "type": "ClassSelector",
              "name": "dropDown",
              "start": 788,
              "end": 797
            }
          ]
        }
      ]
    },
    "block": {
      "type": "Block",
      "start": 798,
      "end": 859,
      "children": [
        {
          "type": "Declaration",
          "start": 802,
          "end": 832,
          "property": "background-color",
          "value": "var(--LM-15)"
        },
        {
          "type": "Declaration",
          "start": 836,
          "end": 856,
          "property": "color",
          "value": "var(--LM-100)"
        }
      ]
    },
    "start": 773,
    "end": 859
  }
]