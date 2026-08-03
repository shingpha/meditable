/*!
 * meditable v0.2.1
 * Github: https://github.com/geekeditor/meditable
 * (c) 2023-2026 montisan <imontisan@gmail.com>
 * Released under the MIT License.
 */
'use strict';

var renderer = require('../renderer.js');

class MEOrderListRenderer extends renderer.default {
    static type = "order-list";
    static tagName = 'ol';
}

module.exports = MEOrderListRenderer;
