import { languageCodes } from '$lib/types';
export const load = (async ({ url }) => {
    const hashParam = Number(url.searchParams.get('hash'));
    const hash = isNaN(hashParam) ? 0 : hashParam;
    const languageParam = url.searchParams.get('language');
    const isValidLanguageParam = languageCodes.includes(languageParam);
    const language = isValidLanguageParam ? languageParam : 'en';
    return {}; // Object.assign(await loadPageData(hash, language, true), { hash, language })
});
//# sourceMappingURL=+page.server.js.map