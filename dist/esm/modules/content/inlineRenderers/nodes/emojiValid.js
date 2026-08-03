/*!
 * meditable v0.2.1
 * Github: https://github.com/geekeditor/meditable
 * (c) 2023-2026 montisan <imontisan@gmail.com>
 * Released under the MIT License.
 */
import MENode from './node.js';
import { CLASS_NAMES } from '../../../../utils/classNames.js';

class MEEmojiValid extends MENode {
    static type = "emoji_valid";
    renderSelf(data) {
        const { raw } = data;
        if (!this.nodes.el) {
            this.nodes.el = this.make("span", [CLASS_NAMES.ME_NODE]);
            this.nodes.el.innerHTML = `<span class="${CLASS_NAMES.ME_EMOJI_VALID}" spellcheck="false">`;
            this.nodes.el.dataset.nodeType = this.type;
        }
        if (raw !== this.nodes.el.firstChild.textContent) {
            this.nodes.el.firstChild.textContent = raw || '';
        }
    }
}

export { MEEmojiValid as default };
