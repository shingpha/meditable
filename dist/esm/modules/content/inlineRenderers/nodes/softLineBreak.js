/*!
 * meditable v0.2.1
 * Github: https://github.com/geekeditor/meditable
 * (c) 2023-2026 montisan <imontisan@gmail.com>
 * Released under the MIT License.
 */
import MENode from './node.js';
import { CLASS_NAMES } from '../../../../utils/classNames.js';

class MESoftLineBreak extends MENode {
    static type = "soft_line_break";
    static async staticRender() {
        return `<br class="${this.type}"/>`;
    }
    renderSelf(data) {
        if (!this.nodes.el) {
            const classNames = [CLASS_NAMES.ME_NODE, CLASS_NAMES.ME_SOFT_LINE_BREAK];
            if (data.isAtEnd) {
                classNames.push(CLASS_NAMES.ME_LINE_END);
            }
            this.nodes.el = this.make("span", classNames);
            this.nodes.el.dataset.nodeType = this.type;
            this.nodes.holder = this.nodes.el;
        }
        this.nodes.el.textContent = data.lineBreak;
        this.nodes.el.classList.toggle(CLASS_NAMES.ME_LINE_END, data.isAtEnd);
    }
}

export { MESoftLineBreak as default };
