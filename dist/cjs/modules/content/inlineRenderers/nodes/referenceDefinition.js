/*!
 * meditable v0.2.1
 * Github: https://github.com/geekeditor/meditable
 * (c) 2023-2026 montisan <imontisan@gmail.com>
 * Released under the MIT License.
 */
'use strict';

var node = require('./node.js');
var classNames = require('../../../../utils/classNames.js');

class MEReferenceDefinition extends node {
    static type = "reference_definition";
    static async staticRender({ data, innerHTML }) {
        const { leftBracket, rightBracket, titleMarker, leftTitleSpace, rightTitleSpace, title, href } = data;
        return `<span class="${this.type}"><span class="marker">${leftBracket}</span><span class="label">${innerHTML || ''}</span><span class="marker">${rightBracket}</span><span class="href">${href}</span><span class="marker">${leftTitleSpace + titleMarker}</span><span class="title">${title}</span><span class="marker">${titleMarker + rightTitleSpace}</span></span>`;
    }
    get dirty() {
        const { leftBracket, rightBracket, titleMarker, raw, leftTitleSpace, rightTitleSpace, title, href } = this.data;
        const startMarker = leftBracket;
        const middleMarker = rightBracket + href + leftTitleSpace + titleMarker;
        const endMarker = titleMarker + rightTitleSpace;
        if ((startMarker !== this.nodes.el.firstChild?.textContent || endMarker !== this.nodes.el.lastChild?.textContent) || (middleMarker !== this.nodes.el.childNodes[2].textContent) || (title !== this.nodes.el.childNodes[3].textContent)) {
            return true;
        }
        return super.dirty;
    }
    renderSelf(data) {
        const { leftBracket, rightBracket, titleMarker, raw, leftTitleSpace, rightTitleSpace, title, href } = data;
        if (!this.nodes.el || this.nodes.el.childNodes.length !== 5) {
            this.nodes.el = this.make("span", [classNames.CLASS_NAMES.ME_NODE]);
            this.nodes.el.innerHTML = `<span class="${classNames.CLASS_NAMES.ME_FIXED_MARKER}"></span><span class="${classNames.CLASS_NAMES.ME_REFERENCE_LABEL}"></span><span class="${classNames.CLASS_NAMES.ME_FIXED_MARKER}"></span><span class="${classNames.CLASS_NAMES.ME_REFERENCE_TITLE}"></span><span class="${classNames.CLASS_NAMES.ME_FIXED_MARKER}"></span>`;
            this.nodes.el.dataset.nodeType = this.type;
            this.nodes.holder = this.nodes.el.childNodes[1];
        }
        const startMarker = leftBracket;
        const middleMarker = rightBracket + href + leftTitleSpace + titleMarker;
        const endMarker = titleMarker + rightTitleSpace;
        if (startMarker !== this.nodes.el.firstChild.textContent) {
            this.nodes.el.firstChild.textContent = startMarker;
        }
        if (middleMarker !== this.nodes.el.childNodes[2].textContent) {
            this.nodes.el.childNodes[2].textContent = middleMarker;
        }
        if (title !== this.nodes.el.childNodes[3].textContent) {
            this.nodes.el.childNodes[3].textContent = title;
        }
        if (endMarker !== this.nodes.el.lastChild.textContent) {
            this.nodes.el.lastChild.textContent = endMarker;
        }
    }
}

module.exports = MEReferenceDefinition;
