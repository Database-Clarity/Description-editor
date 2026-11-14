import { expect, it } from 'vitest';
import { normaliseCompendiumEnglish as normalize } from '../../src/compendium/englishEvidence.js';

it('equates only enhanced arrows, including historical numeric arrows', () => {
  expect(normalize('<enhanced/> Buff <enhanced/>5 <enhanced/>${1+#d}')).toBe(
    '#e Buff #e5 #e${1+#d}',
  );
  expect(normalize('#element #e5 <enhanced/>word <solar/>')).toBe(
    '#element #e5 <enhanced/>word <solar/>',
  );
  expect(normalize('<enhanced/>5 #e5\nvar e5 = 10')).toBe('<enhanced/>5 #e5\nvar e5 = 10');
});
