/*!
 * meditable v0.2.1
 * Github: https://github.com/geekeditor/meditable
 * (c) 2023-2026 montisan <imontisan@gmail.com>
 * Released under the MIT License.
 */
'use strict';

function regexWithKey(key) {
    const words = [];
    for (let i = 0; i < key.length; i++) {
        words.push(`(${key.charAt(i)})`);
    }
    return new RegExp(`(.*)${words.join('(.*)')}(.*)`);
}
function flattenIteration(result, data) {
    let match;
    if (/(heading\d|paragraph|code|td|tr)$/.test(data.type)) {
        result.push({
            id: data.id,
            text: data.text || '',
            type: data.type,
            match
        });
    }
    const children = data.children || [];
    children.forEach((child) => {
        flattenIteration(result, child);
    });
}
function flattenToOutline(data) {
    const result = [];
    flattenIteration(result, data);
    return result;
}
function filterOutline(outline, { filterKey, filterTypeRegex }) {
    const filterRegex = filterKey ? regexWithKey(filterKey) : null;
    if (!filterRegex && !filterTypeRegex) {
        return outline;
    }
    return outline.filter((it) => {
        const match = filterRegex ? it.text.match(filterRegex) : null;
        it.match = match;
        return (!filterRegex || match) && (!filterTypeRegex || filterTypeRegex.test(it.type));
    });
}

exports.filterOutline = filterOutline;
exports.flattenToOutline = flattenToOutline;
exports.regexWithKey = regexWithKey;
