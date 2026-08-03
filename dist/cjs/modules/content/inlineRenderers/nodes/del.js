/*!
 * meditable v0.2.1
 * Github: https://github.com/geekeditor/meditable
 * (c) 2023-2026 montisan <imontisan@gmail.com>
 * Released under the MIT License.
 */
'use strict';

var em = require('./em.js');

class MEDel extends em {
    static type = "del";
    static tagName = "del";
}

module.exports = MEDel;
