import { afterEach, describe, expect, it, vi } from 'vitest';
import type { EditorData } from '../../stores/data';
import { canonicalHash, navigationGroups, variantHashes } from './catalog';
import { createStepping } from './stepping';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { MemoryRouter } from 'react-router-dom';
import { TooltipNavigation } from './TooltipNavigation';
import { Layout } from './Layout';

const data: EditorData = {
  categories: [
    { id: 'later', label: 'Later', group: 'Weapons', order: 20 },
    { id: 'first', label: 'First', group: 'Armor', order: 10 },
  ],
  items: {
    10: {
      hash: 10,
      name: 'Base',
      icon: '',
      categoryId: 'later',
      inGameDescription: '',
      enhancedHashes: [11, 12],
    },
    11: {
      hash: 11,
      name: 'Enhanced',
      icon: '',
      categoryId: 'later',
      inGameDescription: '',
      baseHash: 10,
    },
    12: {
      hash: 12,
      name: 'Second variant',
      icon: '',
      categoryId: 'later',
      inGameDescription: '',
      baseHash: 10,
    },
    20: { hash: 20, name: 'Armor', icon: '', categoryId: 'first', inGameDescription: '' },
  },
  sandboxAliases: { 99: 11 },
  bundle: {
    sourceCommit: 'abc',
    generatedAt: '2026-10-27T00:00:00Z',
    tooltips: {
      2: {
        hash: 2,
        custom: { name: 'Variables', categoryId: 'globals' },
        text: {},
        associated: [],
      },
    },
    permissions: { users: {} },
    pushed: {},
  },
};

describe('tooltip catalog', () => {
  it('uses grouped dropdowns rather than lists or paging buttons', () => {
    const markup = renderToStaticMarkup(
      createElement(
        MemoryRouter,
        { initialEntries: ['/t/10'] },
        createElement(TooltipNavigation, { data }),
      ),
    );
    expect(markup.match(/<select/g)).toHaveLength(2);
    expect(markup).toContain('<optgroup label="Armor">');
    expect(markup).toContain('<optgroup label="Weapons">');
    expect(markup).not.toContain('<details');
    expect(markup).not.toContain('<button');
    expect(markup).toContain('value="10" selected=""');
    expect(markup).not.toContain('value="11"');
  });
  it('provides one navigation appearance with no density toggle', () => {
    const markup = renderToStaticMarkup(createElement(MemoryRouter, null, createElement(Layout)));
    expect(markup).not.toContain('Comfortable navigation');
    expect(markup).not.toContain('Compact navigation');
    expect(markup).not.toContain('aria-pressed');
  });
  it('resolves enhanced variants and sandbox aliases to the base', () => {
    expect(canonicalHash(11, data)).toBe(10);
    expect(canonicalHash(99, data)).toBe(10);
    expect(canonicalHash(555, data)).toBe(555);
    expect(variantHashes(10, data)).toEqual([10, 11, 12]);
  });
  it('groups categories in order and lists variants only with their base', () => {
    const groups = navigationGroups(data, '');
    expect(groups.map((group) => group.name)).toEqual(['Armor', 'Weapons', 'Other']);
    expect(
      groups.flatMap((group) =>
        group.sections.flatMap((section) => section.items.map((item) => item.hash)),
      ),
    ).toEqual([20, 10, 2]);
  });
  it('searches names, base hashes, variant hashes, and sandbox hashes', () => {
    for (const search of ['BASE', 'Enhanced', '10', '11', '99']) {
      expect(navigationGroups(data, search)[0]?.sections[0]?.items[0]?.hash).toBe(10);
    }
    expect(navigationGroups(data, 'missing')).toEqual([]);
  });
  it('reports alias cycles rather than looping', () => {
    expect(() => canonicalHash(98, { ...data, sandboxAliases: { 98: 99, 99: 98 } })).toThrow(
      'Cyclic',
    );
  });
});

describe('stepping history', () => {
  afterEach(() => vi.useRealTimers());
  function history() {
    const entries = ['/t/10'];
    const navigate = vi.fn((path: string, { replace }: { replace: boolean }) => {
      if (replace) entries[entries.length - 1] = path;
      else entries.push(path);
    });
    return { entries, navigate, stepping: createStepping(navigate) };
  }
  it('replaces immediately, then adds exactly one entry after 1 second idle', () => {
    vi.useFakeTimers();
    const { entries, stepping } = history();
    stepping.step('/t/10', '/t/20');
    expect(entries).toEqual(['/t/20']);
    vi.advanceTimersByTime(900);
    stepping.step('/t/20', '/t/30');
    vi.advanceTimersByTime(999);
    expect(entries).toEqual(['/t/30']);
    vi.advanceTimersByTime(1);
    expect(entries).toEqual(['/t/10', '/t/30']);
  });
  it('commits before an explicit selection so back returns to the stepped tooltip', () => {
    vi.useFakeTimers();
    const { entries, stepping, navigate } = history();
    stepping.step('/t/10', '/t/20');
    stepping.commit();
    navigate('/review', { replace: false });
    vi.advanceTimersByTime(1500);
    expect(entries).toEqual(['/t/10', '/t/20', '/review']);
  });
  it('cancels the timer on pop/unmount without later navigation', () => {
    vi.useFakeTimers();
    const { stepping, navigate } = history();
    stepping.step('/t/10', '/t/20');
    stepping.cancel();
    navigate.mockClear();
    vi.advanceTimersByTime(2000);
    expect(navigate).not.toHaveBeenCalled();
  });
  it('does not duplicate history when a gesture returns to its origin', () => {
    vi.useFakeTimers();
    const { entries, stepping } = history();
    stepping.step('/t/10', '/t/20');
    stepping.step('/t/20', '/t/10');
    vi.advanceTimersByTime(1000);
    expect(entries).toEqual(['/t/10']);
  });
});
