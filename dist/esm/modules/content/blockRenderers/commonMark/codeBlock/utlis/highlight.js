/*!
 * meditable v0.2.1
 * Github: https://github.com/geekeditor/meditable
 * (c) 2023-2026 montisan <imontisan@gmail.com>
 * Released under the MIT License.
 */
import { Languages } from './languages.js';
import hljs from 'highlight.js/lib/core';

for (const key in Languages) {
    if (Object.prototype.hasOwnProperty.call(Languages, key)) {
        const lang = Languages[key];
        hljs.registerLanguage(key, lang);
        hljs.configure({
        // classPrefix: Constant.classPrefix,
        });
    }
}
function highlight(lang, code) {
    return lang && Languages[lang] ? hljs.highlight(code, { language: lang }) : hljs.highlightAuto(code);
}

export { highlight };
