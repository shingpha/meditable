/*!
 * meditable v0.2.1
 * Github: https://github.com/geekeditor/meditable
 * (c) 2023-2026 montisan <imontisan@gmail.com>
 * Released under the MIT License.
 */
'use strict';

var em = require('./em.js');

class MESuperScript extends em {
    static type = "sup";
    static tagName = "sup";
}

module.exports = MESuperScript;
