/*!
 * meditable v0.2.1
 * Github: https://github.com/geekeditor/meditable
 * (c) 2023-2026 montisan <imontisan@gmail.com>
 * Released under the MIT License.
 */
import MENode from './node.js';
import { CLASS_NAMES } from '../../../../utils/classNames.js';

class MEHtmlBr extends MENode {
    static type = "html_br";
    static async staticRender() {
        return `<br class="${this.type}"/>`;
    }
    renderSelf(data) {
        const { tag, openTag } = data;
        const classNames = [CLASS_NAMES.ME_HTML_TAG];
        if (!this.nodes.el) {
            this.nodes.el = this.make("span", [CLASS_NAMES.ME_NODE]);
            this.nodes.el.innerHTML = `<span class="${CLASS_NAMES.ME_MARKER}" spellcheck="false">`;
            this.nodes.el.dataset.nodeType = this.type;
            this.nodes.holder = this.make(tag, classNames);
            this.nodes.el.appendChild(this.nodes.holder);
        }
        if (openTag !== this.nodes.el.firstChild.textContent) {
            this.nodes.el.firstChild.textContent = openTag || '';
        }
    }
}

export { MEHtmlBr as default };
