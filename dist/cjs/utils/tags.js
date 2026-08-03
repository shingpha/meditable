/*!
 * meditable v0.2.1
 * Github: https://github.com/geekeditor/meditable
 * (c) 2023-2026 montisan <imontisan@gmail.com>
 * Released under the MIT License.
 */
'use strict';

var htmlTags = require('html-tags');
var voidHtmlTags = require('html-tags/void');

const VOID_HTML_TAGS = voidHtmlTags;
const HTML_TAGS = htmlTags;

exports.HTML_TAGS = HTML_TAGS;
exports.VOID_HTML_TAGS = VOID_HTML_TAGS;
