import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, test } from 'vitest';
import { parseMarkup, weaponTypeNames } from '@clarity/core';
import { TooltipPreview, type TooltipPreviewProps } from './TooltipPreview';
import { allLabelled, previewLines, weaponChoices } from './weaponChoices';

const text = [
  'Shared line.',
  '<weapons Sword, Hand Cannon>',
  'Blade or cannon.',
  '</weapons>',
  '<weapons other>',
  'Everything else.',
  '</weapons>',
].join('\n');

function render(props: Partial<TooltipPreviewProps> = {}) {
  return renderToStaticMarkup(
    createElement(TooltipPreview, {
      text,
      lang: 'en',
      name: 'Frame',
      globals: { variables: '', titles: '' },
      ...props,
    }),
  );
}

const options = (html: string) =>
  [...html.matchAll(/<option value="([^"]*)"/g)].map((match) => match[1]);

describe('weapon-type picker', () => {
  test('offers the facts of the tooltip plus All (labelled), and previews the first type', () => {
    const html = render({ weaponTypes: ['Hand Cannon', 'Pulse Rifle'] });
    expect(options(html)).toEqual(['Hand Cannon', 'Pulse Rifle', allLabelled]);
    expect(html).toContain('All (labelled)');
    expect(html).toContain('Blade or cannon.');
    expect(html).not.toContain('Everything else.');
    expect(html).toContain('Shared line.');
  });

  test('falls back to every canonical type when no facts are known', () => {
    expect(options(render())).toEqual([...weaponTypeNames, allLabelled]);
    expect(render()).toContain('Everything else.');
  });

  test('previews another type or all sections labelled', () => {
    const pulse = render({
      weaponTypes: ['Hand Cannon', 'Pulse Rifle'],
      initialWeapon: 'Pulse Rifle',
    });
    expect(pulse).toContain('Everything else.');
    expect(pulse).not.toContain('Blade or cannon.');
    const all = render({ weaponTypes: ['Hand Cannon', 'Pulse Rifle'], initialWeapon: allLabelled });
    const plain = all.replace(/<[^>]+>/g, '');
    expect(plain).toContain('Hand Cannons: Blade or cannon.');
    expect(plain).toContain('Pulse Rifles: Everything else.');
    expect(all).toContain('Shared line.');
  });

  test('an unavailable initial choice falls back to the first type', () => {
    expect(render({ weaponTypes: ['Sword'], initialWeapon: 'Glaive' })).toContain(
      'Blade or cannon.',
    );
  });

  test('is hidden when the text has no weapon-type sections', () => {
    const html = render({ text: 'Plain text.' });
    expect(html).not.toContain('Preview weapon type');
    expect(html).toContain('Plain text.');
  });

  test('extra tags named by a section are offered when there are no facts', () => {
    const lines = parseMarkup('<weapons Grenade>\nBoom\n</weapons>').lines;
    expect(weaponChoices(lines, undefined)).toEqual([...weaponTypeNames, 'Grenade']);
    expect(previewLines(lines, 'Grenade', undefined).map((line) => line.weaponTypes)).toEqual([
      undefined,
    ]);
  });
});
