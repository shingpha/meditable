/*!
 * meditable v0.2.1
 * Github: https://github.com/geekeditor/meditable
 * (c) 2023-2026 montisan <imontisan@gmail.com>
 * Released under the MIT License.
 */
'use strict';

var node = require('./node.js');
var classNames = require('../../../../utils/classNames.js');

class MEMultipleMath extends node {
    static type = "multiple_math";
    renderSelf(data) {
        const { marker } = data;
        if (!this.nodes.el) {
            this.nodes.el = this.make("span", [classNames.CLASS_NAMES.ME_NODE]);
            this.nodes.el.innerHTML = `<span class="${classNames.CLASS_NAMES.ME_FIXED_MARKER}" spellcheck="false">${marker}</span>`;
            this.nodes.el.dataset.nodeType = this.type;
        }
    }
}

module.exports = MEMultipleMath;
