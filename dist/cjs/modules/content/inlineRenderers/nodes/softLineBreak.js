/*!
 * meditable v0.2.1
 * Github: https://github.com/geekeditor/meditable
 * (c) 2023-2026 montisan <imontisan@gmail.com>
 * Released under the MIT License.
 */
'use strict';

var node = require('./node.js');
var classNames = require('../../../../utils/classNames.js');

class MESoftLineBreak extends node {
    static type = "soft_line_break";
    static async staticRender() {
        return `<br class="${this.type}"/>`;
    }
    renderSelf(data) {
        if (!this.nodes.el) {
            const classNames$1 = [classNames.CLASS_NAMES.ME_NODE, classNames.CLASS_NAMES.ME_SOFT_LINE_BREAK];
            if (data.isAtEnd) {
                classNames$1.push(classNames.CLASS_NAMES.ME_LINE_END);
            }
            this.nodes.el = this.make("span", classNames$1);
            this.nodes.el.dataset.nodeType = this.type;
            this.nodes.holder = this.nodes.el;
        }
        this.nodes.el.textContent = data.lineBreak;
        this.nodes.el.classList.toggle(classNames.CLASS_NAMES.ME_LINE_END, data.isAtEnd);
    }
}

module.exports = MESoftLineBreak;
