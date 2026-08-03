/*!
 * meditable v0.2.1
 * Github: https://github.com/geekeditor/meditable
 * (c) 2023-2026 montisan <imontisan@gmail.com>
 * Released under the MIT License.
 */
import MENode from './node.js';
import { CLASS_NAMES } from '../../../../utils/classNames.js';

class MEHeader extends MENode {
    static type = "header";
    static async staticRender({ data }) {
        const content = (data.content || ' ').substring(1);
        return content ? `<${this.tagName} class="${this.type}">${content}</${this.tagName}>` : '';
    }
    get dirty() {
        const marker = this.data?.marker;
        if (marker && (marker !== this.nodes.el.firstChild?.textContent)) {
            return true;
        }
        return false;
    }
    renderSelf(data) {
        if (!this.nodes.el) {
            this.nodes.el = this.make("span", [CLASS_NAMES.ME_NODE]);
            this.nodes.el.innerHTML = `<span class="${CLASS_NAMES.ME_MARKER}"></span><span class="${CLASS_NAMES.MU_HEADER_SPACE}"></span>`;
            this.nodes.el.dataset.type = this.type;
            this.nodes.holder = this.nodes.el.lastChild;
        }
        const marker = (data.marker || "").substring(0, data.range.end - data.range.start - (data.content || '').length + 1);
        if (this.nodes.el.firstChild && marker !== this.nodes.el.firstChild.textContent) {
            this.nodes.el.firstChild.textContent = marker || '';
        }
        const content = (data.content || ' ').substring(1);
        // if(content !== this.nodes.holder.textContent) {
        //     this.nodes.holder.textContent = content
        // }
        data.marker = marker;
        data.content = content;
    }
}

export { MEHeader as default };
