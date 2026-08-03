/*!
 * meditable v0.2.1
 * Github: https://github.com/geekeditor/meditable
 * (c) 2023-2026 montisan <imontisan@gmail.com>
 * Released under the MIT License.
 */
import MENode from './node.js';
import { CLASS_NAMES } from '../../../../utils/classNames.js';

class MEHtmlComment extends MENode {
    static type = "html_comment";
    renderSelf(data) {
        const { openTag } = data;
        if (!this.nodes.el) {
            this.nodes.el = this.make("span", [CLASS_NAMES.ME_NODE]);
            this.nodes.el.innerHTML = `<span class="${CLASS_NAMES.ME_FIXED_MARKER}" spellcheck="false">`;
            this.nodes.el.dataset.nodeType = this.type;
        }
        if (openTag !== this.nodes.el.firstChild.textContent) {
            this.nodes.el.firstChild.textContent = openTag || '';
        }
    }
}

export { MEHtmlComment as default };
