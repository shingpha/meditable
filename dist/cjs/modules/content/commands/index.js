/*!
 * meditable v0.2.1
 * Github: https://github.com/geekeditor/meditable
 * (c) 2023-2026 montisan <imontisan@gmail.com>
 * Released under the MIT License.
 */
'use strict';

var inline = require('./inline.js');
var format = require('./format.js');

var commands = {
    format: format.format,
    removeformat: format.removeformat,
    bold: inline.bold,
    italic: inline.italic,
    subscript: inline.subscript,
    supscript: inline.supscript,
    underline: inline.underline,
    strikethrough: inline.strikethrough,
    mark: inline.mark,
    code: inline.code,
    math: inline.math
};

module.exports = commands;
