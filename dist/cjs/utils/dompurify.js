/*!
 * meditable v0.2.1
 * Github: https://github.com/geekeditor/meditable
 * (c) 2023-2026 montisan <imontisan@gmail.com>
 * Released under the MIT License.
 */
'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var purify = require('dompurify');

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

exports.PREVIEW_DOMPURIFY_CONFIG = PREVIEW_DOMPURIFY_CONFIG;
exports.default = sanitize;
exports.isValidAttribute = isValidAttribute;
