/*!
 * meditable v0.2.1
 * Github: https://github.com/geekeditor/meditable
 * (c) 2023-2026 montisan <imontisan@gmail.com>
 * Released under the MIT License.
 */
'use strict';

var zh = require('./zh.js');
var en = require('./en.js');

var resources = {
    zh,
    'zh-CN': zh,
    'zh-TW': zh,
    'en-US': en,
    en
};

module.exports = resources;
