/*!
 * meditable v0.2.1
 * Github: https://github.com/geekeditor/meditable
 * (c) 2023-2026 montisan <imontisan@gmail.com>
 * Released under the MIT License.
 */
'use strict';

var renderer = require('../renderer.js');

class MEBlockQuoteRenderer extends renderer.default {
    static type = "block-quote";
    static tagName = 'blockquote';
}

module.exports = MEBlockQuoteRenderer;
