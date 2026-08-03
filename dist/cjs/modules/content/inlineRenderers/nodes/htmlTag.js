/*!
 * meditable v0.2.1
 * Github: https://github.com/geekeditor/meditable
 * (c) 2023-2026 montisan <imontisan@gmail.com>
 * Released under the MIT License.
 */
'use strict';

var node = require('./node.js');
var classNames = require('../../../../utils/classNames.js');
var dompurify = require('../../../../utils/dompurify.js');
var nodeTypes = require('../../../../utils/nodeTypes.js');

class MEHtmlTag extends node {
    static type = "html_tag";
    static async staticRender({ data, innerHTML }) {
        const { tag, openTag, closeTag, attrs } = data;
        const tagName = nodeTypes.BLOCK_TYPE6.includes(tag) || !dompurify.default(`<${tag}>`) ? "span" : tag;
        const classNames = [this.type];
        const attributes = {};
        if (attrs.class && /\S/.test(attrs.class)) {
            const names = attrs.class.split(/\s+/);
            classNames.push(...names);
        }
        if (tagName === "code" || tagName === "kbd") {
            Object.assign(attributes, { spellcheck: "false" });
        }
        for (const attr of Object.keys(attrs)) {
            if (attr !== "class") {
                const attrData = attrs[attr];
                if (dompurify.isValidAttribute(tag, attr, attrData)) {
                    attributes[attr] = attrData;
                }
            }
        }
        const attrString = Object.entries(attributes).map(([key, value]) => (`${key}="${value}"`)).join(" ");
        return `<${tagName} class="${classNames.join(" ")}" ${attrString}>${innerHTML}</${tagName}>`;
    }
    get dirty() {
        const closeTag = this.data?.closeTag;
        const openTag = this.data?.openTag;
        const content = this.data?.content;
        if (openTag !== this.nodes.el.firstChild?.textContent || closeTag !== this.nodes.el.lastChild?.textContent || content !== this.nodes.holder.textContent) {
            return true;
        }
        return false;
    }
    renderSelf(data) {
        const { tag, openTag, closeTag, attrs } = data;
        const { start, end } = data.range;
        const tagName = nodeTypes.BLOCK_TYPE6.includes(tag) || !dompurify.default(`<${tag}>`) ? "span" : tag;
        const classNames$1 = [classNames.CLASS_NAMES.ME_HTML_TAG];
        const attributes = {};
        const dataset = {
            start,
            end,
            raw: data.raw,
        };
        if (attrs.class && /\S/.test(attrs.class)) {
            const names = attrs.class.split(/\s+/);
            classNames$1.push(...names);
        }
        if (tagName === "code" || tagName === "kbd") {
            Object.assign(attributes, { spellcheck: "false" });
        }
        for (const attr of Object.keys(attrs)) {
            if (attr !== "class") {
                const attrData = attrs[attr];
                if (dompurify.isValidAttribute(tag, attr, attrData)) {
                    attributes[attr] = attrData;
                }
            }
        }
        if (!this.nodes.el) {
            this.nodes.el = this.make("span", [classNames.CLASS_NAMES.ME_NODE]);
            this.nodes.el.innerHTML = `<span class="${classNames.CLASS_NAMES.ME_MARKER}" spellcheck="false"></span><span class="${classNames.CLASS_NAMES.ME_MARKER}" spellcheck="false"></span>`;
            this.nodes.el.dataset.nodeType = this.type;
            this.nodes.holder = this.make(tagName, classNames$1, attributes, dataset);
            this.nodes.el.insertBefore(this.nodes.holder, this.nodes.el.lastChild);
        }
        else {
            if (tagName !== this.nodes.holder.tagName.toLowerCase()) {
                const docFrame = document.createDocumentFragment();
                let node;
                while ((node = this.nodes.holder.firstChild)) {
                    docFrame.appendChild(node);
                }
                const holder = this.make(tagName, classNames$1, attributes, dataset);
                holder.appendChild(docFrame);
                this.nodes.holder.replaceWith(holder);
                this.nodes.holder = holder;
            }
            else {
                const el = this.nodes.holder;
                classNames$1.forEach((className) => {
                    el.classList.toggle(className, true);
                });
                el.classList.forEach((className) => {
                    el.classList.toggle(className, classNames$1.includes(className));
                });
                for (let key in el.attributes) {
                    const value = attributes[key];
                    if (value) {
                        el.setAttribute(key, value);
                        delete attributes[key];
                    }
                    else {
                        el.removeAttribute(key);
                    }
                }
                for (let key in attributes) {
                    el.setAttribute(key, attributes[key]);
                }
                for (const key in dataset) {
                    if (Object.prototype.hasOwnProperty.call(dataset, key)) {
                        el.dataset[key] = dataset[key];
                    }
                }
            }
        }
        if (openTag !== this.nodes.el.firstChild.textContent) {
            this.nodes.el.firstChild.textContent = openTag || '';
        }
        if (closeTag !== this.nodes.el.lastChild.textContent) {
            this.nodes.el.lastChild.textContent = closeTag || '';
        }
    }
}

module.exports = MEHtmlTag;
