/*!
 * meditable v0.2.1
 * Github: https://github.com/geekeditor/meditable
 * (c) 2023-2026 montisan <imontisan@gmail.com>
 * Released under the MIT License.
 */
import { bold, italic, subscript, supscript, underline, strikethrough, mark, code, math } from './inline.js';
import { format, removeformat } from './format.js';

var commands = {
    format,
    removeformat,
    bold,
    italic,
    subscript,
    supscript,
    underline,
    strikethrough,
    mark,
    code,
    math
};

export { commands as default };
