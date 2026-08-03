/*!
 * meditable v0.2.1
 * Github: https://github.com/geekeditor/meditable
 * (c) 2023-2026 montisan <imontisan@gmail.com>
 * Released under the MIT License.
 */
import MEModule from '../module.js';
import { blockPatch } from './utils/patch.js';
import { generateId } from '../../utils/utils.js';
import { CLASS_NAMES } from '../../utils/classNames.js';
import { findBlockByElement } from './utils/find.js';

class MEBlock extends MEModule {
    parent = null;
    id;
    type;
    children = [];
    renderer;
    constructor(instance) {
        super(instance);
        this.dragOver = this.dragOver.bind(this);
        this.dragLeave = this.dragLeave.bind(this);
    }
    get root() {
        let root = this;
        while (root.parent)
            root = root.parent;
        return root;
    }
    get path() {
        const path = this.parent?.path || [];
        return [...path, this.index];
    }
    get index() {
        if (this.parent) {
            return this.parent.children.findIndex((b) => b.id === this.id);
        }
        return -1;
    }
    get previous() {
        if (this.parent) {
            return this.parent.children[this.index - 1] || null;
        }
        return null;
    }
    get next() {
        if (this.parent) {
            return this.parent.children[this.index + 1] || null;
        }
        return null;
    }
    get isFirstChild() {
        return this.index === 0;
    }
    get isLastChild() {
        if (this.parent) {
            return this.index === this.parent.children.length - 1;
        }
        return false;
    }
    get isOnlyChild() {
        return this.parent?.children.length === 1;
    }
    get firstChild() {
        return this.children[0];
    }
    get lastChild() {
        return this.children[this.children.length - 1];
    }
    get isOutMostBlock() {
        return this.parent === this.instance.context.content;
    }
    get isRoot() {
        return !this.parent || this === this.instance.context.content;
    }
    get outMostBlock() {
        let block = this;
        while (block) {
            if (block.isOutMostBlock) {
                return block;
            }
            block = block.parent;
        }
        return null;
    }
    get data() {
        return {
            id: this.id,
            meta: this.renderer.meta,
            text: this.renderer.text,
            type: this.type,
            children: this.children.map((block) => block.data)
        };
    }
    get hasMedia() {
        const mediaTags = [
            'img',
            'iframe',
            'video',
            'audio',
            'source',
            'input',
            'textarea',
            'twitterwidget',
        ];
        return !!this.nodes.el.querySelector(mediaTags.join(','));
    }
    set actived(state) {
        this.nodes.el.classList.toggle(CLASS_NAMES.ME_BLOCK__ACTIVED, state);
    }
    get actived() {
        return this.nodes.el.classList.contains(CLASS_NAMES.ME_BLOCK__ACTIVED);
    }
    set focused(state) {
        this.nodes.el.classList.toggle(CLASS_NAMES.ME_BLOCK__FOCUSED, state);
    }
    get focused() {
        return this.nodes.el.classList.contains(CLASS_NAMES.ME_BLOCK__FOCUSED);
    }
    set selected(state) {
        this.nodes.el.classList.toggle(CLASS_NAMES.ME_BLOCK__SELECTED, state);
    }
    get selected() {
        return this.nodes.el.classList.contains(CLASS_NAMES.ME_BLOCK__SELECTED);
    }
    set dropTarget(state) {
        this.nodes.el.classList.toggle(CLASS_NAMES.ME_BLOCK__DROP_TARGET, state);
    }
    get dropTarget() {
        return this.nodes.el.classList.contains(CLASS_NAMES.ME_BLOCK__DROP_TARGET);
    }
    render({ data, parent, cursor }) {
        this.type = data.type;
        this.id = data.id;
        this.parent = parent || null;
        blockPatch.call(this, data, cursor, MEBlock);
        this.nodes.el.classList.toggle(CLASS_NAMES.ME_BLOCK, true);
        this.nodes.el.dataset.id = data.id;
        this.nodes.el['BLOCK_INSTANCE'] = this;
        this.nodes.el.dataset.blockType = this.type;
        this.nodes.holder['BLOCK_RENDERER_INSTANCE'] = this.renderer;
        if (cursor?.focusBlock === this) {
            this.focused = true;
        }
        if (!this.isRoot) {
            this.mutableListeners.on(this.nodes.el, 'dragover', this.dragOver);
            this.mutableListeners.on(this.nodes.el, 'dragleave', this.dragLeave);
        }
        return this.nodes.el;
    }
    queryBlock(path) {
        if (typeof path === 'string') {
            if (path === this.id) {
                return this;
            }
            let find;
            for (let i = 0; i < this.children.length; i++) {
                const child = this.children[i];
                find = child.queryBlock(path);
                if (find) {
                    break;
                }
            }
            return find;
        }
        const index = path.shift();
        if (typeof index === 'undefined') {
            return this;
        }
        const block = this.children[index];
        return block && path.length ? block.queryBlock(path) : block;
    }
    findBlock(el) {
        return findBlockByElement(el);
    }
    insert(options = {}) {
        if (!this.nodes.holder) {
            return null;
        }
        let { data, index, needToFocus, focus, replace } = options;
        needToFocus = typeof needToFocus === 'undefined' ? false : needToFocus;
        focus = focus || { offset: 0 };
        let newIndex = typeof index === 'undefined' ? this.children.length : index;
        data = data || { type: "paragraph", id: generateId() };
        const newBlock = new MEBlock(this.instance);
        let cursor = null;
        if (needToFocus) {
            //TODO: focus
            cursor = {
                anchor: focus,
                focus,
                anchorBlock: newBlock,
                focusBlock: newBlock
            };
        }
        newBlock.render({ data, parent: this, cursor });
        const parentEl = this.nodes.holder;
        if (!this.children.length || newIndex >= this.children.length) {
            this.children.push(newBlock);
            parentEl.insertBefore(newBlock.nodes.el, null);
        }
        else {
            if (replace) {
                const replaceBlock = this.children[newIndex];
                replaceBlock.nodes.el.remove();
                replaceBlock.parent = null;
                this.children.splice(newIndex, 1, newBlock);
            }
            else {
                this.children.splice(newIndex, 0, newBlock);
            }
            if (newIndex > 0) {
                const previousBlock = this.children[newIndex - 1];
                previousBlock.nodes.el.insertAdjacentElement("afterend", newBlock.nodes.el);
            }
            else {
                const nextBlock = this.children[newIndex + 1];
                if (nextBlock) {
                    nextBlock.nodes.el.insertAdjacentElement("beforebegin", newBlock.nodes.el);
                }
                else {
                    parentEl.insertBefore(newBlock.nodes.el, null);
                }
            }
        }
        if (cursor) {
            //TODO: focus
            const { selection } = this.instance.context.editable;
            selection.setCursor(cursor);
        }
        return newBlock;
    }
    append(options = {}) {
        return this.insert({ ...options, index: this.children.length });
    }
    insertAdjacent(position = "afterend", options = {}) {
        if (position === "beforebegin" || position === "afterend") {
            if (this.parent) {
                const index = this.index;
                const insertIndex = position === 'afterend' ? index + 1 : index;
                return this.parent.insert({ ...options, index: insertIndex });
            }
        }
        else {
            return this.insert({ ...options, index: position === "afterbegin" ? 0 : this.children.length });
        }
        return null;
    }
    replaceWith({ data, needToFocus, focus }) {
        if (this.parent) {
            return this.parent.insert({ data, replace: true, index: this.index, needToFocus, focus });
        }
        return null;
    }
    firstContentInDescendant() {
        let firstContentBlock = this;
        while (firstContentBlock.children && firstContentBlock.children.length) {
            firstContentBlock = firstContentBlock.children[0];
        }
        return firstContentBlock;
    }
    lastContentInDescendant() {
        let lastContentBlock = this;
        while (lastContentBlock.children && lastContentBlock.children.length) {
            lastContentBlock = lastContentBlock.children[lastContentBlock.children.length - 1];
        }
        return lastContentBlock;
    }
    previousContentInContext() {
        if (this.isRoot) {
            return null;
        }
        const { parent } = this;
        if (this.previous) {
            return this.previous.lastContentInDescendant();
        }
        else {
            return parent.previousContentInContext();
        }
    }
    previousInContext() {
        if (this.isRoot) {
            return null;
        }
        const { parent } = this;
        return this.previous || parent.previousInContext();
    }
    // Get next content block in block tree.
    nextContentInContext() {
        if (this.isRoot) {
            return null;
        }
        const { parent } = this;
        if (this.next) {
            return this.next.firstContentInDescendant();
        }
        else {
            return parent.nextContentInContext();
        }
    }
    nextInContext() {
        if (this.isRoot) {
            return null;
        }
        const { parent } = this;
        return this.next || parent.nextInContext();
    }
    paste() {
    }
    insertAtEnd() {
        return this.insert();
    }
    mergeWith(block) {
        //TODO: mergin block
    }
    remove() {
        if (this.parent) {
            const index = this.index;
            this.nodes.el.remove();
            this.parent.children.splice(index, 1);
            this.parent = null;
        }
    }
    getAncestors() {
        const ancestors = [];
        let block = this.parent;
        while (block && !block.isRoot) {
            ancestors.push(block);
            block = block.parent;
        }
        return ancestors;
    }
    getCommonAncestors(block) {
        const myAncestors = this.getAncestors();
        const blockAncestors = block.getAncestors();
        const commonAncestors = [];
        for (const a of myAncestors) {
            if (blockAncestors.includes(a)) {
                commonAncestors.push(a);
            }
        }
        return commonAncestors;
    }
    closestBlock(blockType) {
        if (this.type === blockType) {
            return this;
        }
        let parent = this.parent;
        while (parent) {
            if (parent.type === blockType) {
                return parent;
            }
            parent = parent.parent;
        }
        return null;
    }
    farthestBlock(blockType) {
        const results = [];
        if (this.type === blockType) {
            results.push(this);
        }
        let parent = this.parent;
        while (parent) {
            if (parent.type === blockType) {
                results.push(parent);
            }
            parent = parent.parent;
        }
        return results.pop();
    }
    contains(child) {
        const children = this.children;
        return children.some((c) => (c.id === child.id) || c.contains(child));
    }
    dragOver(event) {
        this.dropTarget = true;
        event.stopPropagation();
    }
    dragLeave(event) {
        this.dropTarget = false;
    }
}

export { MEBlock as default };
