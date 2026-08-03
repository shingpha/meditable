/*!
 * meditable v0.2.1
 * Github: https://github.com/geekeditor/meditable
 * (c) 2023-2026 montisan <imontisan@gmail.com>
 * Released under the MIT License.
 */
'use strict';

var renderer = require('../../renderer.js');

class MECodeBlockRenderer extends renderer.default {
    static type = "code-block";
    static tagName = 'pre';
    static customClassName = "hljs code__pre";
    updateContent() {
        super.updateContent();
        this.nodes.el.dataset.codeType = this.meta.type;
        return true;
    }
    forceUpdate() {
        const languageRenderer = this.block.firstContentInDescendant().renderer;
        const codeRendererer = this.block.lastContentInDescendant().renderer;
        codeRendererer.render({ meta: { lang: languageRenderer.text }, text: codeRendererer.text });
        if (languageRenderer.text.length) {
            this.meta.type = 'fenced';
            this.updateContent();
        }
    }
}

module.exports = MECodeBlockRenderer;
