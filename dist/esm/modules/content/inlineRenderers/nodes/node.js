/*!
 * meditable v0.2.1
 * Github: https://github.com/geekeditor/meditable
 * (c) 2023-2026 montisan <imontisan@gmail.com>
 * Released under the MIT License.
 */
import domUtils from '../../../../utils/domUtils.js';
import MEModule from '../../../module.js';
import { CLASS_NAMES } from '../../../../utils/classNames.js';
import { inlinePatch } from '../../utils/patch.js';
import { getTextContent } from '../../utils/dom.js';

class MENode extends MEModule {
    static nodes = {};
    static type = "text";
    static tagName = "span";
    _data;
    blockRenderer;
    children = [];
    static register(node) {
        this.nodes[node.type] = node;
    }
    static async staticRender({ data }) {
        const { raw } = data;
        return `<${this.tagName} class="${this.type}">${raw}</${this.tagName}>`;
    }
    constructor(instance) {
        super(instance.instance);
        this.blockRenderer = instance;
    }
    get type() {
        return this.constructor['type'];
    }
    get dirty() {
        const childNodes = Array.from(this.nodes.el.childNodes);
        return (childNodes.length > 1 && childNodes.some((node) => node.nodeType === 3)) || (this.children && this.children.some((child) => child.dirty));
    }
    get data() {
        return this._data;
    }
    get tagName() {
        return this.constructor['tagName'];
    }
    get textContent() {
        return getTextContent(this.nodes.el, [CLASS_NAMES.ME_INLINE_RENDER]);
    }
    renderSelf(data) {
        if (!this.nodes.el) {
            this.nodes.el = this.make(this.tagName, [CLASS_NAMES.ME_NODE]);
            this.nodes.el.dataset.nodeType = this.type;
            this.nodes.holder = this.nodes.el;
        }
    }
    render(data) {
        this.renderSelf(data);
        // remove wild text nodes
        if (this.nodes.el.childNodes.length > 1) {
            Array.from(this.nodes.el.childNodes).forEach((node) => {
                if (node.nodeType === 3) {
                    this.nodes.el.removeChild(node);
                }
            });
        }
        if (this.nodes.holder) {
            if (data.children) {
                inlinePatch.call(this, data.children);
            }
            else if (typeof data.content !== "undefined") {
                const content = data.content;
                if (content !== this.nodes.holder.textContent) {
                    this.nodes.holder.textContent = content;
                }
            }
        }
        this._data = data;
        this.nodes.el.classList.toggle(CLASS_NAMES.ME_NODE__ACTIVED, !!data.actived);
        return this.nodes.el;
    }
    make(tagName, classNames = null, attributes = {}, dataset = {}) {
        return domUtils.make(tagName, classNames, attributes, dataset);
    }
}

export { MENode as default };
