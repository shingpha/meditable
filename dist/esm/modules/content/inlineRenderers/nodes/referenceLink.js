/*!
 * meditable v0.2.1
 * Github: https://github.com/geekeditor/meditable
 * (c) 2023-2026 montisan <imontisan@gmail.com>
 * Released under the MIT License.
 */
import MENode from './node.js';
import { CLASS_NAMES } from '../../../../utils/classNames.js';
import { sanitizeHyperlink } from '../../../../utils/url.js';

class MEReferenceLink extends MENode {
    static type = "reference_link";
    static async staticRender({ data, innerHTML }) {
        const { href, title } = data;
        const hyperlink = sanitizeHyperlink(encodeURI(href));
        return `<${this.tagName} class="${this.type}" target="_blank" href="${hyperlink}" title="${title}">${innerHTML || ''}</${this.tagName}>`;
    }
    get dirty() {
        const { raw, anchor } = this.data;
        const startMarker = "[";
        const endMarker = raw.substring(1 + anchor.length);
        if ((startMarker !== this.nodes.el.firstChild?.textContent || endMarker !== this.nodes.el.lastChild?.textContent) || (anchor !== this.nodes.holder.textContent)) {
            return true;
        }
        return super.dirty;
    }
    get tagName() {
        return 'a';
    }
    renderSelf(data) {
        const { raw, href, title, anchor } = data;
        const { start, end } = data.range;
        const dataset = {
            start,
            end,
            raw
        };
        const hyperlink = sanitizeHyperlink(encodeURI(href));
        if (!this.nodes.el) {
            this.nodes.el = this.make("span", [CLASS_NAMES.ME_NODE]);
            this.nodes.el.innerHTML = `<span class="${CLASS_NAMES.ME_MARKER}"></span><span class="${CLASS_NAMES.ME_MARKER}"></span>`;
            this.nodes.el.dataset.nodeType = this.type;
            this.nodes.holder = this.make(this.tagName, [CLASS_NAMES.ME_REFERENCE_LINK], { spellcheck: "false", target: "_blank", href: hyperlink, title }, dataset);
            this.nodes.el.insertBefore(this.nodes.holder, this.nodes.el.lastChild);
        }
        else {
            const el = this.nodes.holder;
            el.href = hyperlink;
            for (const key in dataset) {
                if (Object.prototype.hasOwnProperty.call(dataset, key)) {
                    el.dataset[key] = dataset[key];
                }
            }
        }
        const startMarker = "[";
        const endMarker = raw.substring(1 + anchor.length);
        if (startMarker !== this.nodes.el.firstChild.textContent) {
            this.nodes.el.firstChild.textContent = startMarker;
        }
        if (endMarker !== this.nodes.el.lastChild.textContent) {
            this.nodes.el.lastChild.textContent = endMarker;
        }
    }
}

export { MEReferenceLink as default };
