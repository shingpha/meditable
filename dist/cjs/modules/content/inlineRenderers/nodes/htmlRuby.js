/*!
 * meditable v0.2.1
 * Github: https://github.com/geekeditor/meditable
 * (c) 2023-2026 montisan <imontisan@gmail.com>
 * Released under the MIT License.
 */
'use strict';

var node = require('./node.js');
var classNames = require('../../../../utils/classNames.js');

class MEHtmlRuby extends node {
    static type = "html_ruby";
    get dirty() {
        const content = this.data?.raw;
        if (content !== this.textContent) {
            return true;
        }
        return false;
    }
    renderSelf(data) {
        const { raw, openTag, closeTag } = data;
        const { start, end } = data.range;
        const dataset = {
            start: start + openTag.length, // '<ruby>'.length
            end: end - closeTag.length, //'</ruby>'.length
        };
        if (!this.nodes.el) {
            this.nodes.el = this.make("span", [classNames.CLASS_NAMES.ME_NODE, classNames.CLASS_NAMES.ME_RUBY]);
            this.nodes.el.innerHTML = `<span class="${classNames.CLASS_NAMES.ME_MARKER}" spellcheck="false"></span>`;
            this.nodes.el.dataset.nodeType = this.type;
            const preview = this.make('span', [classNames.CLASS_NAMES.ME_INLINE_RENDER], {
                contenteditable: "false",
                spellcheck: "false",
            }, dataset);
            this.nodes.el.appendChild(preview);
        }
        else {
            const el = this.nodes.el.lastElementChild;
            for (const key in dataset) {
                if (Object.prototype.hasOwnProperty.call(dataset, key)) {
                    el.dataset[key] = dataset[key];
                }
            }
        }
        if (raw !== this.nodes.el.firstChild.textContent) {
            this.nodes.el.firstChild.textContent = raw;
        }
        if (raw !== this.nodes.el.lastElementChild.innerHTML) {
            this.nodes.el.lastElementChild.innerHTML = raw;
        }
    }
}

module.exports = MEHtmlRuby;
