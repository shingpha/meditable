/*!
 * meditable v0.2.1
 * Github: https://github.com/geekeditor/meditable
 * (c) 2023-2026 montisan <imontisan@gmail.com>
 * Released under the MIT License.
 */
'use strict';

var dompurify = require('./dompurify.js');

const URL_REG = /^http(s)?:\/\/([a-z0-9\-._~]+\.[a-z]{2,}|[0-9.]+|localhost|\[[a-f0-9.:]+\])(:[0-9]{1,5})?\/[\S]+/i;
const sanitizeHyperlink = (rawLink) => {
    if (rawLink &&
        typeof rawLink === "string" &&
        dompurify.isValidAttribute("a", "href", rawLink)) {
        return rawLink;
    }
    return "";
};

exports.URL_REG = URL_REG;
exports.sanitizeHyperlink = sanitizeHyperlink;
