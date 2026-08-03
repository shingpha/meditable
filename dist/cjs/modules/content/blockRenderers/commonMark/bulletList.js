/*!
 * meditable v0.2.1
 * Github: https://github.com/geekeditor/meditable
 * (c) 2023-2026 montisan <imontisan@gmail.com>
 * Released under the MIT License.
 */
'use strict';

var renderer = require('../renderer.js');

class MEBulletListRenderer extends renderer.default {
    static type = "bullet-list";
    static tagName = 'ul';
    render({ text, meta, cursor }) {
        const rendered = super.render({ text, meta, cursor });
        if (rendered && meta) {
            this.nodes.el.dataset.marker = meta.marker;
        }
        return rendered;
    }
}

module.exports = MEBulletListRenderer;
