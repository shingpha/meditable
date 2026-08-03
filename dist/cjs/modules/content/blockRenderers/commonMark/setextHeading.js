/*!
 * meditable v0.2.1
 * Github: https://github.com/geekeditor/meditable
 * (c) 2023-2026 montisan <imontisan@gmail.com>
 * Released under the MIT License.
 */
'use strict';

var index = require('./paragraph/index.js');

class MESetextHeading1Renderer extends index {
    static type = "setext-heading1";
    static tagName = 'h1';
}
class MESetextHeading2Renderer extends index {
    static type = "setext-heading2";
    static tagName = 'h2';
}

exports.MESetextHeading1Renderer = MESetextHeading1Renderer;
exports.MESetextHeading2Renderer = MESetextHeading2Renderer;
