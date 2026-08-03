/*!
 * meditable v0.2.1
 * Github: https://github.com/geekeditor/meditable
 * (c) 2023-2026 montisan <imontisan@gmail.com>
 * Released under the MIT License.
 */
import MENode from './node.js';
import { CLASS_NAMES } from '../../../../utils/classNames.js';
import escapeCharactersMap from '../../../../utils/escapeCharacter.js';

class MEHtmlEscape extends MENode {
    static type = "html_escape";
    static async staticRender({ data }) {
        const { escapeCharacter } = data;
        const character = escapeCharactersMap[escapeCharacter];
        return character;
    }
    get dirty() {
        const escapeCharacter = this.data?.escapeCharacter;
        if (escapeCharacter !== this.nodes.el.firstChild?.textContent) {
            return true;
        }
        return false;
    }
    renderSelf(data) {
        const { escapeCharacter } = data;
        const character = escapeCharactersMap[escapeCharacter];
        const { start, end } = data.range;
        const dataset = {
            begin: 0,
            length: end - start
        };
        if (!this.nodes.el) {
            this.nodes.el = this.make("span", [CLASS_NAMES.ME_NODE, CLASS_NAMES.ME_HTML_ESCAPE]);
            this.nodes.el.innerHTML = `<span class="${CLASS_NAMES.ME_MARKER}" spellcheck="false">`;
            this.nodes.el.dataset.nodeType = this.type;
            this.nodes.holder = this.make('span', [CLASS_NAMES.ME_INLINE_RENDER], {
                contenteditable: "false",
                spellcheck: "false",
            }, dataset);
            this.nodes.el.appendChild(this.nodes.holder);
        }
        else {
            const el = this.nodes.holder;
            for (const key in dataset) {
                if (Object.prototype.hasOwnProperty.call(dataset, key)) {
                    el.dataset[key] = dataset[key];
                }
            }
        }
        if (character !== this.nodes.holder.innerHTML) {
            this.nodes.holder.innerHTML = character;
        }
        if (escapeCharacter !== this.nodes.el.firstChild.textContent) {
            this.nodes.el.firstChild.textContent = escapeCharacter;
        }
    }
}

export { MEHtmlEscape as default };
