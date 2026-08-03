/*!
 * meditable v0.2.1
 * Github: https://github.com/geekeditor/meditable
 * (c) 2023-2026 montisan <imontisan@gmail.com>
 * Released under the MIT License.
 */
'use strict';

var node = require('./node.js');
var classNames = require('../../../../utils/classNames.js');
var url = require('../../../../utils/url.js');

class MEAutoLink extends node {
    static type = "auto_link";
    static tagName = "a";
    static async staticRender({ data }) {
        const { isLink, href, email, content } = data;
        const hyperlink = url.sanitizeHyperlink(isLink ? encodeURI(href) : `mailto:${email}`);
        return `<${this.tagName} class="${this.type}" target="_blank" href="${hyperlink}">${content}</${this.tagName}>`;
    }
    get dirty() {
        const content = this.data?.url || this.data?.email;
        if (("<" !== this.nodes.el.firstChild?.textContent || ">" !== this.nodes.el.lastChild?.textContent) || (content !== this.nodes.holder.textContent)) {
            return true;
        }
        return false;
    }
    renderSelf(data) {
        const { isLink, href, email } = data;
        const hyperlink = url.sanitizeHyperlink(isLink ? encodeURI(href) : `mailto:${email}`);
        if (!this.nodes.el) {
            this.nodes.el = this.make("span", [classNames.CLASS_NAMES.ME_NODE]);
            this.nodes.el.innerHTML = `<span class="${classNames.CLASS_NAMES.ME_MARKER}"><</span><span class="${classNames.CLASS_NAMES.ME_MARKER}">></span>`;
            this.nodes.el.dataset.nodeType = this.type;
            this.nodes.holder = this.make(this.tagName, [classNames.CLASS_NAMES.ME_AUTO_LINK], { spellcheck: "false", target: "_blank", href: hyperlink });
            this.nodes.el.insertBefore(this.nodes.holder, this.nodes.el.lastChild);
        }
        else {
            const el = this.nodes.holder;
            el.href = hyperlink;
        }
        if ("<" !== this.nodes.el.firstChild.textContent) {
            this.nodes.el.firstChild.textContent = "<";
        }
        if (">" !== this.nodes.el.lastChild.textContent) {
            this.nodes.el.lastChild.textContent = ">";
        }
    }
}

module.exports = MEAutoLink;
