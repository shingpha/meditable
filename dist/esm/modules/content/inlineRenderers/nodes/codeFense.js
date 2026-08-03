/*!
 * meditable v0.2.1
 * Github: https://github.com/geekeditor/meditable
 * (c) 2023-2026 montisan <imontisan@gmail.com>
 * Released under the MIT License.
 */
import MENode from './node.js';
import { CLASS_NAMES } from '../../../../utils/classNames.js';

class MECodeFense extends MENode {
    static type = "code_fense";
    get dirty() {
        const marker = this.data?.marker;
        if (marker && (marker !== this.nodes.el.firstChild?.textContent)) {
            return true;
        }
        return super.dirty;
    }
    renderSelf(data) {
        if (!this.nodes.el) {
            this.nodes.el = this.make("span", [CLASS_NAMES.ME_NODE]);
            this.nodes.el.innerHTML = `<span class="${CLASS_NAMES.ME_MARKER}"></span><span></span>`;
            this.nodes.el.dataset.type = this.type;
            this.nodes.holder = this.nodes.el.lastChild;
        }
        else if (!this.nodes.holder.parentNode) {
            // fix: holer node  removed by Backspace key
            this.nodes.el.appendChild(this.nodes.holder);
        }
        const marker = data.marker || "";
        if (this.nodes.el.firstChild && marker !== this.nodes.el.firstChild.textContent) {
            this.nodes.el.firstChild.textContent = marker || '';
        }
        const content = data.content || '';
        if (content !== this.nodes.holder.textContent) {
            this.nodes.holder.textContent = content;
        }
    }
}

export { MECodeFense as default };
