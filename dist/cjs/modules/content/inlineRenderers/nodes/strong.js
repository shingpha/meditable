/*!
 * meditable v0.2.1
 * Github: https://github.com/geekeditor/meditable
 * (c) 2023-2026 montisan <imontisan@gmail.com>
 * Released under the MIT License.
 */
'use strict';

var em = require('./em.js');

class MEStrong extends em {
    static type = "strong";
    static tagName = "strong";
}

module.exports = MEStrong;
