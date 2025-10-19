import { defineConfig, presetUno, transformerCompileClass, presetMini, transformerVariantGroup  } from 'unocss'

const floatRegex = '(\\d+\\.?\\d*)'

const reg = /^flex={direction: (row|column|row-reverse|column-reverse)}$/

export default defineConfig({
  presets: [presetMini],
  transformers: [
    transformerCompileClass()
  ],
  rules: [
    [
      /^flex=direction:(row|column|row-reverse|column-reverse)$/,
      ([, d]) => ({ display: 'flex', 'flex-direction': d }),
      { autocomplete: 'flex=direction:row' }, // <-- this
    ],
  ],
})
