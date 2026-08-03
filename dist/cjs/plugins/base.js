/*!
 * meditable v0.2.1
 * Github: https://github.com/geekeditor/meditable
 * (c) 2023-2026 montisan <imontisan@gmail.com>
 * Released under the MIT License.
 */
'use strict';

var module$1 = require('../modules/module.js');

class MEPluginBase extends module$1 {
    options;
    constructor(instance, options) {
        super(instance);
        this.options = options || {};
    }
}

module.exports = MEPluginBase;
