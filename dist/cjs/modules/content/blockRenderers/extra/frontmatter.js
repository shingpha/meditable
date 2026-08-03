/*!
 * meditable v0.2.1
 * Github: https://github.com/geekeditor/meditable
 * (c) 2023-2026 montisan <imontisan@gmail.com>
 * Released under the MIT License.
 */
'use strict';

var renderer = require('../renderer.js');

class MEFrontmatterRenderer extends renderer.default {
    static type = "frontmatter";
    static tagName = 'pre';
    forceUpdate() {
        const codeRendererer = this.block.lastContentInDescendant().renderer;
        const text = codeRendererer.text;
        this.render({ text });
    }
}

module.exports = MEFrontmatterRenderer;
