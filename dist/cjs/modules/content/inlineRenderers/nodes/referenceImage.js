/*!
 * meditable v0.2.1
 * Github: https://github.com/geekeditor/meditable
 * (c) 2023-2026 montisan <imontisan@gmail.com>
 * Released under the MIT License.
 */
'use strict';

var node = require('./node.js');
var classNames = require('../../../../utils/classNames.js');
var image = require('../../utils/image.js');

class MEReferenceImage extends node {
    static type = "reference_image";
    img;
    static async staticRender({ data, labels }) {
        const { label, alt } = data;
        let href = "";
        let title = "";
        if (labels.has(label.toLowerCase())) {
            ({ href, title } = labels.get(label.toLowerCase()));
        }
        const { src } = image.getImageSrc(href);
        const attributes = { alt, src, title };
        const attrString = Object.entries(attributes).map(([key, value]) => (`${key}="${value}"`)).join(" ");
        return `<span class="${this.type}"><img ${attrString} /></span>`;
    }
    get dirty() {
        const content = this.data?.raw;
        if (content !== this.nodes.el.firstChild.textContent) {
            return true;
        }
        return false;
    }
    renderSelf(data) {
        const { raw, label, alt } = data;
        const { start, end } = data.range;
        const dataset = {
            start: start + 2 + alt.length, // label
            end: end - 1, //
        };
        const labels = this.instance.context.state.labels;
        let href = "";
        let title = "";
        if (labels.has(label.toLowerCase())) {
            ({ href, title } = labels.get(label.toLowerCase()));
        }
        const { src } = image.getImageSrc(href);
        const attributes = { alt, src, title };
        if (!this.nodes.el) {
            this.nodes.el = this.make("span", [classNames.CLASS_NAMES.ME_NODE, classNames.CLASS_NAMES.ME_REFERENCE_IMAGE]);
            this.nodes.el.innerHTML = `<span class="${classNames.CLASS_NAMES.ME_MARKER}" spellcheck="false"></span>`;
            this.nodes.el.dataset.nodeType = this.type;
            const preview = this.make('span', [classNames.CLASS_NAMES.ME_INLINE_RENDER], {
                contenteditable: "false",
                spellcheck: "false",
            }, dataset);
            this.nodes.el.appendChild(preview);
            this.img = this.make('img', [], attributes);
            this.nodes.el.appendChild(this.img);
            // this.nodes.holder = this.nodes.el.firstChild as HTMLElement;
        }
        else {
            const el = this.nodes.el.lastElementChild;
            for (const key in dataset) {
                if (Object.prototype.hasOwnProperty.call(dataset, key)) {
                    el.dataset[key] = dataset[key];
                }
            }
            for (let key in attributes) {
                this.img.setAttribute(key, attributes[key]);
            }
        }
        if (raw !== this.nodes.el.firstChild.textContent) {
            this.nodes.el.firstChild.textContent = raw;
        }
    }
}

module.exports = MEReferenceImage;
