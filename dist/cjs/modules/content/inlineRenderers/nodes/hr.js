/*!
 * meditable v0.2.1
 * Github: https://github.com/geekeditor/meditable
 * (c) 2023-2026 montisan <imontisan@gmail.com>
 * Released under the MIT License.
 */
'use strict';

var node = require('./node.js');
var classNames = require('../../../../utils/classNames.js');

class MEHr extends node {
    static type = "hr";
    get dirty() {
        const marker = this.data?.marker;
        if (marker && (marker !== this.nodes.el.firstChild?.textContent || marker !== this.nodes.el.lastChild?.textContent)) {
            return true;
        }
        return false;
    }
    renderSelf(data) {
        if (!this.nodes.el) {
            this.nodes.el = this.make("span", [classNames.CLASS_NAMES.ME_NODE]);
            this.nodes.el.innerHTML = `<span class="${classNames.CLASS_NAMES.ME_MARKER}">${data.marker}</span>`;
            this.nodes.el.dataset.nodeType = this.type;
        }
        const marker = data.marker;
        if (this.nodes.el.firstChild && marker !== this.nodes.el.firstChild.textContent) {
            this.nodes.el.firstChild.textContent = marker || '***';
        }
    }
}

module.exports = MEHr;
