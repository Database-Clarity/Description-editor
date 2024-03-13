export class TypedObject {
    static entries(obj) {
        return Object.entries(obj);
    }
    static keys(obj) {
        return Object.keys(obj);
    }
    static fromEntries(entries) {
        return Object.fromEntries(entries);
    }
}
export const perkTypes = [
    'Armor Trait Exotic',
    'Armor Mod General',
    'Armor Mod Combat',
    'Armor Mod Activity',
    'Armor Mod Seasonal',
    // ---------
    'Weapon Perk',
    'Weapon Perk Exotic',
    // ---------
    'Weapon Trait',
    'Weapon Trait Exotic',
    'Weapon Trait Origin',
    'Weapon Trait Origin Exotic',
    'Weapon Trait Enhanced',
    'Weapon Trait Enhanced Exotic',
    // ---------
    'Weapon Frame',
    'Weapon Frame Exotic',
    'Weapon Frame Enhanced',
    'Weapon Frame Enhanced Exotic',
    // ---------
    'Weapon Catalyst Exotic',
    // ---------
    'Weapon Mod',
    // ---------
    'Subclass Fragment',
    'Subclass Aspect',
    'Subclass Super',
    'Subclass Grenade',
    'Subclass Melee',
    'Subclass Class',
    'Subclass Movement',
    // ---------
    'Ghost Mod',
];
export const languageNames = {
    en: 'English',
    de: 'German',
    es: 'Spanish',
    'es-mx': 'Spanish (Mexico)',
    fr: 'French',
    it: 'Italian',
    ja: 'Japanese',
    ko: 'Korean',
    pl: 'Polish',
    'pt-br': 'Portuguese (Brazil)',
    ru: 'Russian',
    'zh-chs': 'Chinese (Simplified)',
    'zh-cht': 'Chinese (Traditional)',
};
export const languageCodes = TypedObject.keys(languageNames);
export const languageCodesUnderscore = languageCodes.map((lang) => lang.replace('-', '_'));
export const editorTypes = ['normal', 'dual', 'multiLanguage'];
//# sourceMappingURL=types.js.map