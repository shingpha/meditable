/*!
 * meditable v0.2.1
 * Github: https://github.com/geekeditor/meditable
 * (c) 2023-2026 montisan <imontisan@gmail.com>
 * Released under the MIT License.
 */
import MENode from './node.js';
import { CLASS_NAMES } from '../../../../utils/classNames.js';

class MEHardLineBreak extends MENode {
    static type = "hard_line_break";
    static async staticRender({ data }) {
        const { spaces } = data;
        return `<span class="${this.type}">${spaces}<br/></span>`;
    }
    _isAtEnd;
    renderSelf(data) {
        if (!this.nodes.el) {
            const classNames = [CLASS_NAMES.ME_NODE];
            classNames.push(CLASS_NAMES.ME_HARD_LINE_BREAK);
            if (data.isAtEnd) {
                this.nodes.el = this.make("span", classNames);
                this.nodes.el.innerHTML = `<span class="${CLASS_NAMES.ME_HARD_LINE_BREAK_SPACE}">${data.spaces}</span><span class="${CLASS_NAMES.ME_LINE_END}">${data.lineBreak}</span>`;
            }
            else {
                this.nodes.el = this.make("span", classNames);
                this.nodes.el.innerHTML = `<span class="${CLASS_NAMES.ME_HARD_LINE_BREAK_SPACE}">${data.spaces}</span>${data.lineBreak}`;
            }
            this.nodes.el.dataset.nodeType = this.type;
            this.nodes.holder = this.nodes.el;
            this._isAtEnd = !!data.isAtEnd;
        }
        else if (this._isAtEnd !== (!!data.isAtEnd)) {
            if (data.isAtEnd) {
                this.nodes.el.innerHTML = `<span class="${CLASS_NAMES.ME_HARD_LINE_BREAK_SPACE}">${data.spaces}</span><span class="${CLASS_NAMES.ME_LINE_END}">${data.lineBreak}</span>`;
            }
            else {
                this.nodes.el.innerHTML = `<span class="${CLASS_NAMES.ME_HARD_LINE_BREAK_SPACE}">${data.spaces}</span>${data.lineBreak}`;
            }
            this._isAtEnd = !!data.isAtEnd;
        }
        else {
            const spaceNode = this._isAtEnd ? this.nodes.el.firstChild.firstChild : this.nodes.el.firstChild;
            if (spaceNode.textContent !== data.spaces) {
                spaceNode.textContent = data.spaces;
            }
        }
    }
}

export { MEHardLineBreak as default };
