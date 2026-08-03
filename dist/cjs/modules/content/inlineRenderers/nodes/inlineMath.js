/*!
 * meditable v0.2.1
 * Github: https://github.com/geekeditor/meditable
 * (c) 2023-2026 montisan <imontisan@gmail.com>
 * Released under the MIT License.
 */
'use strict';

var node = require('./node.js');
var classNames = require('../../../../utils/classNames.js');
var katex = require('katex');
require('katex/dist/contrib/mhchem.min.js');
require('katex/dist/katex.min.css');
var math = require('../../../../utils/math.js');

class MEInlineMath extends node {
    static type = "inline_math";
    static mathMap = new Map();
    static mathMap2 = new Map();
    static async staticRender({ data }) {
        const math$1 = data.content;
        let mathHtml;
        if (this.mathMap2.has(math$1)) {
            mathHtml = this.mathMap2.get(math$1);
        }
        else {
            mathHtml = await math.tex2svgPromise(math$1);
            this.mathMap2.set(math$1, mathHtml);
        }
        return `<span class="${this.type}">${mathHtml}</span>`;
    }
    get dirty() {
        const content = this.data?.raw;
        if (content !== this.textContent) {
            return true;
        }
        return false;
    }
    get startMarkerNode() {
        return this.nodes.el.firstChild;
    }
    get mathNode() {
        return this.nodes.el.childNodes[1];
    }
    get endMarkerNode() {
        return this.nodes.el.childNodes[2];
    }
    get previewNode() {
        return this.nodes.el.lastElementChild;
    }
    renderSelf(data) {
        const { marker, content: math, } = data;
        const { start, end } = data.range;
        const dataset = {
            begin: marker.length,
            length: end - marker.length - start - marker.length
        };
        const mathMap = MEInlineMath.mathMap;
        const displayMode = false;
        const key = `${math}`;
        let mathHtml = "";
        let renderErr = false;
        if (mathMap.has(key)) {
            mathHtml = mathMap.get(key);
        }
        else {
            try {
                mathHtml = katex.renderToString(math, {
                    displayMode,
                });
                mathMap.set(key, mathHtml);
            }
            catch (err) {
                renderErr = true;
                mathHtml = "Invalid Mathematical Formula";
            }
        }
        if (!this.nodes.el || this.nodes.el.childNodes.length !== 4) {
            this.nodes.el = this.nodes.el || this.make("span", [classNames.CLASS_NAMES.ME_NODE, classNames.CLASS_NAMES.ME_MATH]);
            this.nodes.el.innerHTML = `<span class="${classNames.CLASS_NAMES.ME_MARKER}" spellcheck="false"></span><span class="${classNames.CLASS_NAMES.ME_MARKER} ${classNames.CLASS_NAMES.ME_TEXT}" spellcheck="false"></span><span class="${classNames.CLASS_NAMES.ME_MARKER}" spellcheck="false"></span>`;
            this.nodes.el.dataset.nodeType = this.type;
            const preview = this.make('span', [classNames.CLASS_NAMES.ME_INLINE_RENDER], {
                contenteditable: "false",
                spellcheck: "false",
            }, dataset);
            this.nodes.el.appendChild(preview);
            preview.classList.toggle(classNames.CLASS_NAMES.ME_MATH_ERROR, renderErr);
        }
        else {
            const el = this.previewNode;
            el.classList.toggle(classNames.CLASS_NAMES.ME_MATH_ERROR, renderErr);
            for (const key in dataset) {
                if (Object.prototype.hasOwnProperty.call(dataset, key)) {
                    el.dataset[key] = dataset[key];
                }
            }
        }
        if (marker !== this.startMarkerNode.textContent) {
            this.startMarkerNode.textContent = marker;
        }
        if (marker !== this.endMarkerNode.textContent) {
            this.endMarkerNode.textContent = marker;
        }
        if (math !== this.mathNode.textContent) {
            this.mathNode.textContent = math;
        }
        if (mathHtml !== this.previewNode.innerHTML) {
            this.previewNode.innerHTML = mathHtml;
        }
    }
}

module.exports = MEInlineMath;
