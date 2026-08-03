/*!
 * meditable v0.2.1
 * Github: https://github.com/geekeditor/meditable
 * (c) 2023-2026 montisan <imontisan@gmail.com>
 * Released under the MIT License.
 */
import MENode from './node.js';
import { CLASS_NAMES } from '../../../../utils/classNames.js';

class MEHtmlValidTag extends MENode {
    static type = "html_valid_tag";
    renderSelf(data) {
        const { openTag } = data;
        if (!this.nodes.el) {
            this.nodes.el = this.make("span", [CLASS_NAMES.ME_NODE, CLASS_NAMES.ME_HTML_VALID_TAG]);
            this.nodes.el.innerHTML = `<span class="${CLASS_NAMES.ME_FIXED_MARKER}" spellcheck="false"></span>`;
            this.nodes.el.dataset.nodeType = this.type;
        }
        if (openTag !== this.nodes.el.firstChild.textContent) {
            this.nodes.el.firstChild.textContent = openTag || '';
        }
    }
}

export { MEHtmlValidTag as default };
