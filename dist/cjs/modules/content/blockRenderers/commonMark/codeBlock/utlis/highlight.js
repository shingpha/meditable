/*!
 * meditable v0.2.1
 * Github: https://github.com/geekeditor/meditable
 * (c) 2023-2026 montisan <imontisan@gmail.com>
 * Released under the MIT License.
 */
'use strict';

var languages = require('./languages.js');
var hljs = require('highlight.js/lib/core');

for (const key in languages.Languages) {
    if (Object.prototype.hasOwnProperty.call(languages.Languages, key)) {
        const lang = languages.Languages[key];
        hljs.registerLanguage(key, lang);
        hljs.configure({
        // classPrefix: Constant.classPrefix,
        });
    }
}
function highlight(lang, code) {
    return lang && languages.Languages[lang] ? hljs.highlight(code, { language: lang }) : hljs.highlightAuto(code);
}

exports.highlight = highlight;
