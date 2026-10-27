export interface CompendiumTabConfig {
  name: string;
  nameColumns?: number[];
  descriptionColumns?: number[];
  nameHeaders?: string[];
  descriptionHeaders?: string[];
  sectionHeaders?: string[];
  groups?: CompendiumColumns[];
  cards?: boolean;
  navigationOnly?: boolean;
  sectionOverrides?: Record<string, CompendiumColumns[]>;
}
export interface CompendiumColumns {
  nameColumns: number[];
  descriptionColumns: number[];
  section?: string;
}
const glossary = { nameColumns: [1], descriptionColumns: [3], sectionHeaders: ['Glossary'] };
const armorSlots = [
  'Helmet',
  'Arms',
  'Chest',
  'Legs',
  'Class Item',
  'Raid-Specific',
  'Raid Specific',
  'Activity or Destination Specific',
  'Charged With Light',
  'Warmind Cells',
  'Elemental Wells',
  'Activity-Specific',
];
const artifactCards = (columns: number[], offset: number) =>
  columns.map((column) => ({
    nameColumns: [column],
    descriptionColumns: [column + offset],
  }));
// Columns are zero-based overrides only; recognized headers take precedence on every fetch.
export const compendiumTabs: Record<string, CompendiumTabConfig> = {
  '1038486120': { name: 'Landing', navigationOnly: true },
  '1662574278': { name: 'Weapon Perks' },
  '1287885342': { name: 'Armor Perks' },
  '473308249': { name: 'Artifact Perks', cards: true, groups: artifactCards([2, 5, 8], -1) },
  '1934379638': { name: 'Armor Mods', nameHeaders: armorSlots },
  '618967225': { name: 'Arc', ...glossary },
  '1186062409': { name: 'Solar', ...glossary },
  '1907852650': { name: 'Void', ...glossary },
  '1088259962': { name: 'Stasis', ...glossary },
  '1870531554': { name: 'Strand', ...glossary },
  '1918152785': { name: 'Prismatic', ...glossary },
  '20898389': {
    name: 'Exotic Class',
    sectionHeaders: ['Class-agnostic Perks'],
    groups: [
      { nameColumns: [0], descriptionColumns: [2] },
      { nameColumns: [3], descriptionColumns: [5] },
    ],
  },
  '527596209': {
    name: 'Class Abilities',
    ...glossary,
    sectionHeaders: ['Hunters', 'Titans', 'Warlocks'],
  },
  '441434520': {
    name: 'Exotic Weapons',
    nameColumns: [0],
    descriptionColumns: [3],
    sectionHeaders: ['Kinetic Slot Weapons'],
  },
  '1500097863': { name: 'Exotic Armors', descriptionHeaders: ['Notes'] },
  '1800463143': { name: 'Game Mechanics', nameHeaders: ['Challenge Modifiers', 'Modifier'] },
  '715236319': {
    name: 'OLD Episodic Artifact Perks',
    cards: true,
    groups: artifactCards([2, 5, 8, 11, 14], -1),
  },
  '70425171': {
    name: 'OLD Seasonal Artifact Perks',
    cards: true,
    groups: artifactCards([1, 4, 7, 10, 13], 0),
  },
  '333521426': {
    name: 'OLD Nether Mechanics',
    sectionOverrides: {
      'Heresy Mods': [{ nameColumns: [2], descriptionColumns: [5] }],
      'Minor Boons': [{ nameColumns: [2], descriptionColumns: [3] }],
      'Major Boons': [{ nameColumns: [2], descriptionColumns: [3] }],
    },
  },
  '1925335732': { name: 'OLD Armor Mods', nameHeaders: armorSlots },
  '135237481': { name: 'OLD Game Mechanics', nameHeaders: ['Modifier'] },
  '2137280685': { name: 'OLD Exotic Armors', descriptionHeaders: ['Notes'] },
};
