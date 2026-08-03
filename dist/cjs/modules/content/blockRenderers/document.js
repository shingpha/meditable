/*!
 * meditable v0.2.1
 * Github: https://github.com/geekeditor/meditable
 * (c) 2023-2026 montisan <imontisan@gmail.com>
 * Released under the MIT License.
 */
'use strict';

var renderer = require('./renderer.js');
var utils = require('../../../utils/utils.js');

class MEDocumentRenderer extends renderer.default {
    static type = "document";
    render() {
        if (!this.nodes.el) {
            const { layout } = this.instance.context;
            this.nodes.el = layout.nodes.content;
            this.nodes.holder = this.nodes.el;
        }
        return true;
    }
    clickHandler(event) {
        const lastChild = this.block.lastChild;
        const lastContentBlock = lastChild.lastContentInDescendant();
        if (lastChild.type === 'paragraph' && lastContentBlock.renderer.text === '') {
            lastContentBlock.renderer.setCursor();
        }
        else {
            const data = {
                id: utils.generateId(),
                type: 'paragraph',
                text: ''
            };
            this.block.append({
                data,
                needToFocus: true,
                focus: { offset: 0 }
            });
        }
    }
}

module.exports = MEDocumentRenderer;
