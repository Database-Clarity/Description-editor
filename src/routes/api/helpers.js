import { error } from '@sveltejs/kit';
import { Hf } from '$lib/helperFunction';
import { languageCodes } from '$lib/types';
export function checkLanguages(URLparams, required = false) {
    // check if language parameter if present
    if (!URLparams.has('lang')) {
        return error(400, {
            message: `400 Bad Request: Missing language parameter.`,
        });
    }
    // check if language URL parameter is empty
    if (!required && URLparams.has('lang') && URLparams.get('lang') === '') {
        return languageCodes;
    }
    // check if parameters are valid
    const parameters = URLparams.getAll('lang');
    for (const parameter of parameters) {
        // make sure the parameter is a valid language
        if (!Hf.includes(languageCodes, parameter)) {
            return error(400, {
                message: `400 Bad Request: Invalid language parameter. Language must be one of ${languageCodes.join(', ')}.`,
            });
        }
    }
    return URLparams.getAll('lang');
}
export function checkTimestamps(URLparams) {
    // check if language parameter if present
    if (!URLparams.has('timestamp')) {
        return error(400, {
            message: `400 Bad Request: Missing timestamp parameter. timestamp=number-number parameter is required.`,
        });
    }
    const params = URLparams.get('timestamp')?.split('-') || [undefined, undefined];
    const start = Number(params[0]);
    const end = Number(params[1]);
    if (!Number.isInteger(start) || !Number.isInteger(end) || start < 0 || end < 0) {
        return error(400, {
            message: `400 Bad Request: Invalid timestamp parameter. timestamp=number-number parameter is required.`,
        });
    }
    return {
        start: start > end ? end : start,
        end: end > start ? end : start,
    };
}
export function checkHashes(URLparams, requestHeader) {
    // check if hash parameter if present
    if (!URLparams.has('hash') && !requestHeader.has('hashes')) {
        return error(400, {
            message: `400 Bad Request: Missing hash parameter or hashes header.`,
        });
    }
    // check if hash URL parameter is empty
    if (URLparams.has('hash') && URLparams.get('hash') === '') {
        return true;
    }
    // check if parameters are valid
    const parameters = URLparams.getAll('hash') || requestHeader.get('hashes');
    for (const parameter of parameters) {
        const numberParameter = Number(parameter);
        // make sure the parameter is a number
        if (!Number.isInteger(numberParameter) || numberParameter < 0) {
            return error(400, {
                message: `400 Bad Request: Invalid hash parameter. Hashes must be positive integers.`,
            });
        }
    }
    const hashes = URLparams.getAll('hash') || requestHeader.get('hashes');
    return hashes.map((hash) => Number(hash));
}
//# sourceMappingURL=helpers.js.map