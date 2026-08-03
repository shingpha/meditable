/*!
 * meditable v0.2.1
 * Github: https://github.com/geekeditor/meditable
 * (c) 2023-2026 montisan <imontisan@gmail.com>
 * Released under the MIT License.
 */
import purify from 'dompurify';

const { sanitize, isValidAttribute } = purify;
const PREVIEW_DOMPURIFY_CONFIG = {
    // do not forbid `class` because `code` element use class to present language
    FORBID_ATTR: ["style", "contenteditable"],
    ALLOW_DATA_ATTR: false,
    USE_PROFILES: {
        html: true,
        svg: true,
        svgFilters: true,
        mathMl: false,
    },
    RETURN_TRUSTED_TYPE: false,
};

export { PREVIEW_DOMPURIFY_CONFIG, sanitize as default, isValidAttribute };
