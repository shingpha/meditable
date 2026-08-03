/*!
 * meditable v0.2.1
 * Github: https://github.com/geekeditor/meditable
 * (c) 2023-2026 montisan <imontisan@gmail.com>
 * Released under the MIT License.
 */
import MENode from './node.js';
import { CLASS_NAMES } from '../../../../utils/classNames.js';

class MEAutoLinkExtension extends MENode {
    static type = "auto_link_extension";
    static tagName = "a";
    static async staticRender({ data }) {
        const { linkType, www, url, email, raw } = data;
        const hyperlink = linkType === "www"
            ? encodeURI(`http://${www}`)
            : linkType === "url"
                ? encodeURI(url)
                : `mailto:${email}`;
        return `<${this.tagName} class="${this.type}" target="_blank" href="${hyperlink}">${raw}</${this.tagName}>`;
    }
    get dirty() {
        const content = this.data?.www || this.data.url || this.data?.email;
        if (content && (content !== this.nodes.el.textContent)) {
            return true;
        }
        return false;
    }
    renderSelf(data) {
        const { linkType, www, url, email, raw } = data;
        const hyperlink = linkType === "www"
            ? encodeURI(`http://${www}`)
            : linkType === "url"
                ? encodeURI(url)
                : `mailto:${email}`;
        if (!this.nodes.el) {
            this.nodes.el = this.make("span", [CLASS_NAMES.ME_NODE]);
            this.nodes.el.dataset.nodeType = this.type;
            this.nodes.holder = this.make(this.tagName, [CLASS_NAMES.ME_AUTO_LINK_EXTENSION], { spellcheck: "false", target: "_blank", href: hyperlink });
            this.nodes.el.appendChild(this.nodes.holder);
        }
        const el = this.nodes.holder;
        if (hyperlink !== el.href) {
            el.href = hyperlink;
        }
        if (raw !== el.textContent) {
            el.textContent = raw;
        }
    }
}

export { MEAutoLinkExtension as default };
