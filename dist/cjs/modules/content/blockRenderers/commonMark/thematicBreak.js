/*!
 * meditable v0.2.1
 * Github: https://github.com/geekeditor/meditable
 * (c) 2023-2026 montisan <imontisan@gmail.com>
 * Released under the MIT License.
 */
'use strict';

var index = require('./paragraph/index.js');

class METhematicBreakRenderer extends index {
    static type = "thematic-break";
    static async staticRender() {
        return `<hr class="${this.type}"/>`;
    }
    updateContent(checkUpdate) {
        const isFirstRender = !this.nodes.el;
        const isRendered = super.updateContent(checkUpdate);
        if (isFirstRender) {
            this.nodes.el.appendChild(this.make('hr'));
        }
        return isRendered;
    }
    mouseDownHandler(event) {
        if (event.target === this.nodes.el || event.target.tagName === 'HR') {
            event.preventDefault();
            this.setCursor({ focus: { offset: this.text.length } });
        }
        else {
            super.clickHandler(event);
        }
    }
}

module.exports = METhematicBreakRenderer;
