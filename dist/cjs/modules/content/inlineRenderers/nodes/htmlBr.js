/*!
 * meditable v0.2.1
 * Github: https://github.com/geekeditor/meditable
 * (c) 2023-2026 montisan <imontisan@gmail.com>
 * Released under the MIT License.
 */
'use strict';

var node = require('./node.js');
var classNames = require('../../../../utils/classNames.js');

class MEHtmlBr extends node {
    static type = "html_br";
    static async staticRender() {
        return `<br class="${this.type}"/>`;
    }
    renderSelf(data) {
        const { tag, openTag } = data;
        const classNames$1 = [classNames.CLASS_NAMES.ME_HTML_TAG];
        if (!this.nodes.el) {
            this.nodes.el = this.make("span", [classNames.CLASS_NAMES.ME_NODE]);
            this.nodes.el.innerHTML = `<span class="${classNames.CLASS_NAMES.ME_MARKER}" spellcheck="false">`;
            this.nodes.el.dataset.nodeType = this.type;
            this.nodes.holder = this.make(tag, classNames$1);
            this.nodes.el.appendChild(this.nodes.holder);
        }
        if (openTag !== this.nodes.el.firstChild.textContent) {
            this.nodes.el.firstChild.textContent = openTag || '';
        }
    }
}

module.exports = MEHtmlBr;
