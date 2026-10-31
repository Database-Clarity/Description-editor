import { describe, expect, test } from 'vitest';
import {
  englishWeaponTypeLabels,
  hasOldWeaponTypeSyntax,
  markupWeaponTypes,
  migrateWeaponTypeSyntax,
  parseMarkup,
  specializeWeaponTypes,
  validateText,
  validateWeaponSections,
  weaponTypeNames,
} from '../src/index.js';

const texts = (lines: ReturnType<typeof parseMarkup>['lines']) =>
  lines.map((line) => line.linesContent?.map((span) => span.text ?? '').join('') ?? '[table]');

const tagged = [
  'Shared.',
  '<weapons Sword, Hand Cannon>',
  'Melee and cannons.',
  '</weapons>',
  '<weapons other>',
  'Everything else.',
  '</weapons>',
].join('\n');

describe('canonical vocabulary', () => {
  test('lists the 17 Bungie weapon types and keeps ability tags as extras', () => {
    expect(weaponTypeNames).toHaveLength(17);
    expect(markupWeaponTypes).toEqual(
      expect.arrayContaining(['Grenade', 'Melee', 'Super', 'Heavy Grenade Launcher']),
    );
    for (const name of weaponTypeNames) expect(englishWeaponTypeLabels[name]).toBeTruthy();
  });
});

describe('<weapons> parsing', () => {
  test('tags lines with canonical names, case-insensitively, and resolves other', () => {
    const { lines } = parseMarkup(
      'Shared.\n  <WEAPONS sword ,  hand cannon >  \nOnly these.\n</weapons>\n<weapons other>\nRest.\n</weapons>',
    );
    expect(texts(lines)).toEqual(['Shared.', 'Only these.', 'Rest.']);
    expect(lines[0].weaponTypes).toBeUndefined();
    expect(lines[1].weaponTypes).toEqual(['Sword', 'Hand Cannon']);
    expect(lines[1].weaponOther).toBeUndefined();
    expect(lines[2].weaponOther).toBe(true);
    expect(lines[2].weaponTypes).toContain('Pulse Rifle');
    expect(lines[2].weaponTypes).not.toContain('Sword');
    expect(lines[2].weaponTypes).not.toContain('Hand Cannon');
    expect(lines[1].weaponBlock).not.toBe(lines[2].weaponBlock);
  });

  test('other is the complement of every block, regardless of order', () => {
    const { lines } = parseMarkup(
      '<weapons other>\nRest.\n</weapons>\n<weapons Sniper Rifle>\nSniper.\n</weapons>',
    );
    expect(lines[0].weaponTypes).not.toContain('Sniper Rifle');
    expect(lines[0].weaponTypes).toContain('Sword');
  });

  test('tables and spacers inside a block stay in the block', () => {
    const { lines } = parseMarkup(
      '<weapons Sword>\nIntro\n\n< table wide >\n|b A | B\n| 1 | 2\n<$>\n</weapons>\nAfter',
    );
    expect(lines.map((line) => line.weaponTypes)).toEqual([
      ['Sword'],
      ['Sword'],
      ['Sword'],
      undefined,
    ]);
    expect(lines[2].table).toHaveLength(2);
  });

  test('text without tags is parsed exactly as before', () => {
    expect(parseMarkup('One\n\nTwo').lines.map((line) => line.classNames)).toEqual([
      [],
      ['spacer'],
      [],
    ]);
  });
});

describe('weapon section validation', () => {
  const messages = (text: string) => validateWeaponSections(text).map((issue) => issue.message);

  test('accepts well-formed blocks', () => {
    expect(validateWeaponSections(tagged)).toEqual([]);
  });

  test.each([
    ['unknown name', '<weapons Sword, Lazer>\nx\n</weapons>', 1, 'Unknown weapon type "Lazer"'],
    ['unclosed', 'a\n<weapons Sword>\nx', 2, 'never closed'],
    ['stray close', 'a\n</weapons>', 2, 'Stray </weapons>'],
    ['nesting', '<weapons Sword>\n<weapons Glaive>\nx\n</weapons>\n</weapons>', 2, 'nested'],
    ['empty list', '<weapons>\nx\n</weapons>', 1, 'at least one'],
    ['other with names', '<weapons other, Sword>\nx\n</weapons>', 1, 'cannot be combined'],
    [
      'second other',
      '<weapons other>\nx\n</weapons>\n<weapons other>\ny\n</weapons>',
      4,
      'Only one <weapons other>',
    ],
  ])('reports %s with its line number', (_name, text, line, fragment) => {
    const issue = validateWeaponSections(text).find((entry) => entry.message.includes(fragment));
    expect(issue?.severity).toBe('error');
    expect(issue?.line).toBe(line);
  });

  test('a nested tag produces a single error and the outer block keeps its lines', () => {
    const text = '<weapons Sword>\n<weapons Glaive>\nx\n</weapons>\n</weapons>';
    expect(validateWeaponSections(text)).toHaveLength(1);
    expect(parseMarkup(text).lines[0].weaponTypes).toEqual(['Sword']);
  });

  test('blocks with unknown names are still parsed for the known ones', () => {
    const { lines } = parseMarkup('<weapons Sword, Lazer>\nx\n</weapons>');
    expect(lines[0].weaponTypes).toEqual(['Sword']);
  });

  test('line numbers ignore comments and are reported through validateText', () => {
    const text = '/* one\ntwo */\n// note\n<weapons Nope>\nx\n</weapons>';
    expect(messages(text)).toEqual([expect.stringContaining('Unknown weapon type "Nope"')]);
    const issue = validateText(text, 'en').find((entry) => entry.message.includes('Nope'));
    expect(issue?.message.startsWith('Line 4: ')).toBe(true);
    expect(text.slice(issue?.from, issue?.to)).toBe('<weapons Nope>');
  });

  test('title declarations are separate scopes, each with its own other block', () => {
    const block = (name: string) => `<weapons other>\n${name}\n</weapons>`;
    const text = [
      'See <title A [A] /> and <title B [B] />',
      block('Main'),
      '',
      'title A (',
      block('A fallback'),
      ')',
      'title B (',
      block('B fallback'),
      ')',
    ].join('\n');
    expect(validateWeaponSections(text)).toEqual([]);
    expect(validateText(text, 'en')).toEqual([]);
    const parsed = parseMarkup(text).lines[0].linesContent?.flatMap((span) => span.title ?? []);
    expect(parsed?.map((line) => line.weaponOther)).toEqual([true, true]);
  });

  test('a duplicate other inside one title is rejected at its source line', () => {
    const text = [
      'Main',
      'title A (',
      '<weapons other>',
      'one',
      '</weapons>',
      '<weapons other>',
      'two',
      '</weapons>',
      ')',
    ].join('\n');
    expect(validateWeaponSections(text)).toEqual([
      expect.objectContaining({ line: 6, message: expect.stringContaining('Only one') }),
    ]);
    expect(
      validateText(text, 'en').filter((issue) => issue.message.startsWith('Line 6: Only one')),
    ).toHaveLength(1);
  });

  test('errors inside a title keep the original line numbers', () => {
    const text = 'Main\n\ntitle A (\nx\n<weapons Nope>\ny\n</weapons>\n)';
    expect(validateWeaponSections(text)).toEqual([
      expect.objectContaining({ line: 5, message: expect.stringContaining('"Nope"') }),
    ]);
  });

  test('the old syntax parses and warns', () => {
    const old = '< weapon type (Bow, HC) >\nBows.\n< (other) >\nRest.\n<$$>';
    const { lines } = parseMarkup(old);
    expect(lines[0].weaponTypes).toEqual(['Combat Bow', 'Hand Cannon']);
    expect(lines[1].weaponTypes).not.toContain('Combat Bow');
    expect(lines[1].weaponTypes).toContain('Sword');
    expect(hasOldWeaponTypeSyntax(old)).toBe(true);
    expect(messages(`x\n${old}`)).toEqual([expect.stringMatching(/^Old weapon-type syntax/)]);
    expect(validateWeaponSections(`x\n${old}`)[0]).toMatchObject({ severity: 'warning', line: 2 });
    expect(hasOldWeaponTypeSyntax(tagged)).toBe(false);
  });
});

describe('migrateWeaponTypeSyntax', () => {
  test('rewrites abbreviations, groups, other and tables', () => {
    const old = [
      'Shared',
      '< weapon type (Bow, HC, LMG) >',
      'First.',
      '< table wide >',
      '|b A | B',
      '| 1 | 2',
      '<$>',
      '< (AR, LFR, GL, SMG) >',
      'Second.',
      '< (Pulse, Scout, Sniper, Fusion, Rocket, Trace) >',
      'Third.',
      '< (Heavy GL, Grenade, Melee, Super, Sword, Glaive) >',
      'Fourth.',
      '< (other) >',
      'Rest.',
      '<$$>',
      'End',
    ].join('\n');
    const migrated = migrateWeaponTypeSyntax(old);
    expect(migrated).toBe(
      [
        'Shared',
        '<weapons Combat Bow, Hand Cannon, Machine Gun>',
        'First.',
        '< table wide >',
        '|b A | B',
        '| 1 | 2',
        '<$>',
        '</weapons>',
        '<weapons Auto Rifle, Linear Fusion Rifle, Grenade Launcher, Submachine Gun>',
        'Second.',
        '</weapons>',
        '<weapons Pulse Rifle, Scout Rifle, Sniper Rifle, Fusion Rifle, Rocket Launcher, Trace Rifle>',
        'Third.',
        '</weapons>',
        '<weapons Heavy Grenade Launcher, Grenade, Melee, Super, Sword, Glaive>',
        'Fourth.',
        '</weapons>',
        '<weapons other>',
        'Rest.',
        '</weapons>',
        'End',
      ].join('\n'),
    );
    expect(validateWeaponSections(migrated)).toEqual([]);
    expect(migrateWeaponTypeSyntax(migrated)).toBe(migrated);
  });

  test('migrated text parses to the same lines and tables as the old text', () => {
    const old = '< weapon type (Bow, HC) >\nA\n< table >\n|b X | Y\n<$>\n< (other) >\nB\n<$$>';
    const before = parseMarkup(old).lines;
    const after = parseMarkup(migrateWeaponTypeSyntax(old)).lines;
    const flatten = (lines: typeof before) =>
      lines.map((line) => ({
        ...line,
        weaponBlock: 0,
        weaponTypes: [...(line.weaponTypes ?? [])].sort(),
      }));
    expect(flatten(after)).toEqual(flatten(before));
  });

  test('an early old other keeps the types it covered', () => {
    const old = '< weapon type ( other ) >\nRest\n< ( Sword ) >\nSword text\n<$$>';
    const migrated = migrateWeaponTypeSyntax(old);
    expect(migrated).not.toContain('<weapons other>');
    expect(validateWeaponSections(migrated)).toEqual([]);
    const before = parseMarkup(old).lines;
    const after = parseMarkup(migrated).lines;
    for (const type of ['Sword', 'Glaive', 'Grenade']) {
      expect(texts(specializeWeaponTypes(after, { type }))).toEqual(
        texts(specializeWeaponTypes(before, { type })),
      );
    }
    expect(texts(specializeWeaponTypes(after, { type: 'Sword' }))).toEqual(['Rest', 'Sword text']);
    expect(migrateWeaponTypeSyntax(migrated)).toBe(migrated);
  });

  test('independent old chains with their own fallback stay valid and equivalent', () => {
    const old = [
      '< weapon type ( Sword ) >',
      'S1',
      '< ( other ) >',
      'R1',
      '<$$>',
      'Between',
      '< weapon type ( Glaive ) >',
      'G2',
      '< ( other ) >',
      'R2',
      '<$$>',
    ].join('\n');
    const migrated = migrateWeaponTypeSyntax(old);
    expect(validateWeaponSections(migrated)).toEqual([]);
    expect(migrated.match(/<weapons other>/g)?.length ?? 0).toBeLessThanOrEqual(1);
    const before = parseMarkup(old).lines;
    const after = parseMarkup(migrated).lines;
    for (const type of ['Sword', 'Glaive', 'Hand Cannon', 'Melee']) {
      expect(texts(specializeWeaponTypes(after, { type }))).toEqual(
        texts(specializeWeaponTypes(before, { type })),
      );
    }
  });

  test('a final old other still becomes <weapons other>', () => {
    expect(migrateWeaponTypeSyntax('< weapon type ( Sword ) >\nS\n< ( other ) >\nR\n<$$>')).toBe(
      '<weapons Sword>\nS\n</weapons>\n<weapons other>\nR\n</weapons>',
    );
  });

  test('comments on header and terminator lines are kept and do not block conversion', () => {
    const old = '< weapon type ( Sword ) > // swords\nBody\n<$$> /* end */';
    expect(hasOldWeaponTypeSyntax(old)).toBe(true);
    const migrated = migrateWeaponTypeSyntax(old);
    expect(migrated).toBe('<weapons Sword> // swords\nBody\n</weapons> /* end */');
    expect(validateWeaponSections(migrated)).toEqual([]);
    expect(migrateWeaponTypeSyntax(migrated)).toBe(migrated);
  });

  test('delimiters inside comments are not structure', () => {
    const old = [
      '< weapon type ( Sword ) >',
      '/*',
      '<$$>',
      '*/',
      'Body',
      '<$$>',
      '// < weapon type ( Glaive ) >',
    ].join('\n');
    const migrated = migrateWeaponTypeSyntax(old);
    expect(migrated).toBe(
      [
        '<weapons Sword>',
        '/*',
        '<$$>',
        '*/',
        'Body',
        '</weapons>',
        '// < weapon type ( Glaive ) >',
      ].join('\n'),
    );
    expect(validateWeaponSections(migrated)).toEqual([]);
    expect(texts(parseMarkup(migrated).lines)).toEqual(['Body']);
    expect(migrateWeaponTypeSyntax('// < weapon type ( Sword ) >\nx\n// <$$>')).toBe(
      '// < weapon type ( Sword ) >\nx\n// <$$>',
    );
  });

  test('keeps CRLF line endings, unknown names and text without old blocks', () => {
    expect(migrateWeaponTypeSyntax('a\r\n< weapon type (HC, Zap) >\r\nx\r\n<$$>\r\nb')).toBe(
      'a\r\n<weapons Hand Cannon, Zap>\r\nx\r\n</weapons>\r\nb',
    );
    expect(migrateWeaponTypeSyntax('Plain\n<weapons Sword>\nx\n</weapons>')).toBe(
      'Plain\n<weapons Sword>\nx\n</weapons>',
    );
    expect(migrateWeaponTypeSyntax('< weapon type (HC) >\nunterminated')).toBe(
      '< weapon type (HC) >\nunterminated',
    );
  });
});

describe('specializeWeaponTypes', () => {
  const { lines } = parseMarkup(tagged);

  test('a type keeps shared lines and its own sections, untagged', () => {
    const swords = specializeWeaponTypes(lines, { type: 'Sword' });
    expect(texts(swords)).toEqual(['Shared.', 'Melee and cannons.']);
    expect(swords.every((line) => line.weaponTypes === undefined)).toBe(true);
    expect(texts(specializeWeaponTypes(lines, { type: 'Pulse Rifle' }))).toEqual([
      'Shared.',
      'Everything else.',
    ]);
  });

  test('labelled keeps every section and prefixes each block once', () => {
    const labelled = specializeWeaponTypes(lines, {
      labelled: {},
      among: ['Sword', 'Pulse Rifle'],
    });
    expect(texts(labelled)).toEqual([
      'Shared.',
      'Swords: Melee and cannons.',
      'Pulse Rifles: Everything else.',
    ]);
    expect(labelled.every((line) => line.weaponTypes === undefined)).toBe(true);
  });

  test('labelled uses custom labels, joins multi-type blocks and labels other without among', () => {
    const labelled = specializeWeaponTypes(lines, { labelled: { Sword: 'Schwerter' } });
    expect(texts(labelled)).toEqual([
      'Shared.',
      'Schwerter, Hand Cannons: Melee and cannons.',
      'Other: Everything else.',
    ]);
  });

  test('labelled prefixes only the first line and adds a label line before a table', () => {
    const parsed = parseMarkup(
      '<weapons Sword>\nOne\nTwo\n</weapons>\n<weapons Glaive>\n< table >\n|b A | B\n<$>\n</weapons>',
    ).lines;
    const labelled = specializeWeaponTypes(parsed, { labelled: {} });
    expect(texts(labelled)).toEqual(['Swords: One', 'Two', 'Glaives:', '[table]']);
  });

  test('specialises titles nested in lines', () => {
    const parsed = parseMarkup(
      'See <title Tip [Tip] />\n\ntitle Tip (\n<weapons Sword>\nS\n</weapons>\n<weapons Glaive>\nG\n</weapons>\n)',
    ).lines;
    const nested = specializeWeaponTypes(parsed, { type: 'Sword' })[0].linesContent?.[1].title;
    expect(texts(nested ?? [])).toEqual(['S']);
  });
});
