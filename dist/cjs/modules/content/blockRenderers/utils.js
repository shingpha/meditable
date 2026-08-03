/*!
 * meditable v0.2.1
 * Github: https://github.com/geekeditor/meditable
 * (c) 2023-2026 montisan <imontisan@gmail.com>
 * Released under the MIT License.
 */
'use strict';

var domUtils = require('../../../utils/domUtils.js');

function getCursorYOffset(el, rangeRect) {
    const { y } = rangeRect;
    const { height, top } = el.getBoundingClientRect();
    const lineHeight = parseFloat(getComputedStyle(el).lineHeight);
    const topOffset = Math.floor((y - top) / lineHeight);
    const bottomOffset = Math.round((top + height - lineHeight - y) / lineHeight);
    return {
        topOffset,
        bottomOffset,
    };
}
function adjustOffset(offset, block, event) {
    if (block.type.includes("atx-heading") &&
        event.key === domUtils.keys.ArrowDown) {
        const match = /^\s{0,3}(?:#{1,6})(?:\s{1,}|$)/.exec(block.renderer.text);
        if (match) {
            return match[0].length;
        }
    }
    else if (block.type === 'thematic-break' && event.key === domUtils.keys.ArrowDown) {
        return block.renderer.text.length;
    }
    return offset;
}

exports.adjustOffset = adjustOffset;
exports.getCursorYOffset = getCursorYOffset;
