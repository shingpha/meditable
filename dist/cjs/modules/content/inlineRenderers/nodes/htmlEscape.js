/*!
 * meditable v0.2.1
 * Github: https://github.com/geekeditor/meditable
 * (c) 2023-2026 montisan <imontisan@gmail.com>
 * Released under the MIT License.
 */
'use strict';

var node = require('./node.js');
var classNames = require('../../../../utils/classNames.js');
var escapeCharacter = require('../../../../utils/escapeCharacter.js');

class MEHtmlEscape extends node {
    static type = "html_escape";
    static async staticRender({ data }) {
        const { escapeCharacter: escapeCharacter$1 } = data;
        const character = escapeCharacter.default[escapeCharacter$1];
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
        const { escapeCharacter: escapeCharacter$1 } = data;
        const character = escapeCharacter.default[escapeCharacter$1];
        const { start, end } = data.range;
        const dataset = {
            begin: 0,
            length: end - start
        };
        if (!this.nodes.el) {
            this.nodes.el = this.make("span", [classNames.CLASS_NAMES.ME_NODE, classNames.CLASS_NAMES.ME_HTML_ESCAPE]);
            this.nodes.el.innerHTML = `<span class="${classNames.CLASS_NAMES.ME_MARKER}" spellcheck="false">`;
            this.nodes.el.dataset.nodeType = this.type;
            this.nodes.holder = this.make('span', [classNames.CLASS_NAMES.ME_INLINE_RENDER], {
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
        if (escapeCharacter$1 !== this.nodes.el.firstChild.textContent) {
            this.nodes.el.firstChild.textContent = escapeCharacter$1;
        }
    }
}

module.exports = MEHtmlEscape;
