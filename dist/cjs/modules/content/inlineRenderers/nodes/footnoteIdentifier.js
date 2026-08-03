/*!
 * meditable v0.2.1
 * Github: https://github.com/geekeditor/meditable
 * (c) 2023-2026 montisan <imontisan@gmail.com>
 * Released under the MIT License.
 */
'use strict';

var node = require('./node.js');
var classNames = require('../../../../utils/classNames.js');

class MEFootnoteIdentifier extends node {
    static type = "footnote_identifier";
    static tagName = "a";
    static async staticRender({ data }) {
        const { content } = data;
        return `<sup class="${this.type}"><${this.tagName}>${content}</${this.tagName}></sup>`;
    }
    get dirty() {
        const startMarker = this.data?.marker;
        const endMarker = `]`;
        const content = this.data?.content;
        if ((startMarker !== this.nodes.el.firstChild?.textContent || endMarker !== this.nodes.el.lastChild?.textContent) || (content !== this.nodes.holder.textContent)) {
            return true;
        }
        return super.dirty;
    }
    renderSelf(data) {
        const { marker, content } = data;
        const id = `noteref-${content}`;
        if (!this.nodes.el) {
            this.nodes.el = this.make("sup", [classNames.CLASS_NAMES.ME_NODE], { id });
            this.nodes.el.innerHTML = `<span class="${classNames.CLASS_NAMES.ME_MARKER}"></span><span class="${classNames.CLASS_NAMES.ME_MARKER}"></span>`;
            this.nodes.el.dataset.nodeType = this.type;
            this.nodes.holder = this.make(this.tagName, [classNames.CLASS_NAMES.ME_LINK], { spellcheck: "false" });
            this.nodes.el.insertBefore(this.nodes.holder, this.nodes.el.lastChild);
        }
        else {
            const el = this.nodes.holder;
            el.id = id;
        }
        const startMarker = marker;
        const endMarker = `]`;
        if (startMarker !== this.nodes.el.firstChild.textContent) {
            this.nodes.el.firstChild.textContent = startMarker;
        }
        if (endMarker !== this.nodes.el.lastChild.textContent) {
            this.nodes.el.lastChild.textContent = endMarker;
        }
    }
}

module.exports = MEFootnoteIdentifier;
