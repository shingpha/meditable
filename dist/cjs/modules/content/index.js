/*!
 * meditable v0.2.1
 * Github: https://github.com/geekeditor/meditable
 * (c) 2023-2026 montisan <imontisan@gmail.com>
 * Released under the MIT License.
 */
'use strict';

var block = require('./block.js');
var find = require('./utils/find.js');
var index = require('./commands/index.js');
var classNames = require('../../utils/classNames.js');
var utils = require('../../utils/utils.js');

class MEContent extends block {
    _cacheFocusedBlock = null;
    _cacheActivedNodes = new Set();
    constructor(instance) {
        super(instance);
    }
    get path() {
        return [];
    }
    get focusedBlock() {
        return this._cacheFocusedBlock;
    }
    set focusedBlock(focusBlock) {
        const { _cacheFocusedBlock: blurBlock } = this;
        if (focusBlock !== blurBlock) {
            this._cacheFocusedBlock = focusBlock;
            let needBlurBlocks = [];
            let needActiveBlocks = [];
            if (blurBlock && focusBlock) {
                needActiveBlocks = focusBlock.getAncestors();
                needActiveBlocks.push(focusBlock);
                let block = blurBlock;
                while (block && !block.isRoot && !needActiveBlocks.includes(block)) {
                    needBlurBlocks.push(block);
                    block = block.parent;
                }
            }
            else if (blurBlock) {
                needBlurBlocks = blurBlock.getAncestors();
                needBlurBlocks.push(blurBlock);
            }
            else if (focusBlock) {
                needActiveBlocks = focusBlock.getAncestors();
                needActiveBlocks.push(focusBlock);
            }
            if (needBlurBlocks.length) {
                needBlurBlocks.forEach(b => {
                    b.actived = false;
                });
            }
            if (needActiveBlocks.length) {
                needActiveBlocks.forEach(b => {
                    b.actived = true;
                });
            }
            // Fix 3: 移除库自带的调试 console.log（focusedBlock setter 内），开发期刷屏且与业务无关
            if (blurBlock) {
                blurBlock.focused = false;
            }
            if (focusBlock) {
                focusBlock.focused = true;
            }
        }
    }
    get acitvedNodes() {
        return this._cacheActivedNodes;
    }
    get dropTargetBlock() {
        return find.findDropBlock(this);
    }
    async prepare() {
        for (let key in index) {
            this.instance.context.command.registerCommand(index[key]);
        }
        this.dispatchEvents();
        return true;
    }
    setFocusedBlockBy(childNode) {
        const block = this.findBlock(childNode);
        this.focusedBlock = block;
    }
    clearDropTargetBlock() {
        find.clearDropBlock(this);
    }
    destroy() {
        this.children = [];
        const holder = this.nodes.holder;
        if (holder) {
            holder.innerHTML = '';
        }
    }
    dropPointer() {
        this.focusedBlock = null;
    }
    updateFocusedBlock() {
        const { selection } = this.instance.context.editable;
        const node = selection.focusNode || selection.anchorNode;
        if (node) {
            this.setFocusedBlockBy(node);
        }
    }
    setCursorAtBegin() {
        const firstContentBlock = this.firstContentInDescendant();
        if (firstContentBlock) {
            firstContentBlock.renderer.setCursor();
        }
    }
    setCursorAtEnd() {
        const lastContentBlock = this.lastContentInDescendant();
        if (lastContentBlock) {
            lastContentBlock.renderer.setCursor({ focus: { offset: lastContentBlock.renderer.text.length } });
        }
    }
    setDefaultCursor() {
        const lastContentBlock = this.lastContentInDescendant();
        if (lastContentBlock.type === 'paragraph') {
            lastContentBlock.renderer.setCursor({ focus: { offset: lastContentBlock.renderer.text.length } });
        }
        else {
            const data = {
                id: utils.generateId(),
                type: 'paragraph',
                text: ''
            };
            this.append({
                data,
                needToFocus: true,
                focus: { offset: 0 }
            });
        }
    }
    dispatchEvents() {
        const { event, editable } = this.instance.context;
        const { selection } = editable;
        const eventHandler = (type, event) => {
            const { anchorBlock, isSameBlock, isCollapsed } = selection.cursor;
            if (type === 'click') {
                if (!isCollapsed) {
                    return;
                }
                const { target } = event;
                const blockEl = target.closest(`.${classNames.CLASS_NAMES.ME_BLOCK}`);
                if (blockEl) {
                    const blockInstance = blockEl['BLOCK_INSTANCE'];
                    blockInstance.renderer.clickHandler(event);
                }
                else {
                    this.renderer.clickHandler(event);
                }
                return;
            }
            if (!isSameBlock || !anchorBlock) {
                if (!anchorBlock) {
                    event.preventDefault();
                }
                return;
            }
            switch (type) {
                case 'click': {
                    anchorBlock.renderer.clickHandler(event);
                    break;
                }
                case 'input': {
                    anchorBlock.renderer.inputHandler(event);
                    break;
                }
                case 'keydown': {
                    anchorBlock.renderer.keydownHandler(event);
                    break;
                }
                case 'keyup': {
                    anchorBlock.renderer.keyupHandler(event);
                    break;
                }
                case 'compositionend':
                case 'compositionstart': {
                    anchorBlock.renderer.composeHandler(event);
                    break;
                }
            }
        };
        const types = ['click', 'input', 'keydown', 'keyup', 'compositionend', 'compositionstart'];
        event.on(types, eventHandler);
        event.on("mousedown", (type, event) => {
            const anchorBlock = this.findBlock(event.target);
            if (anchorBlock) {
                anchorBlock.renderer.mouseDownHandler(event);
            }
        });
        event.on('selectionchange', () => {
            const { focusNode, focusOffset, anchorNode, anchorOffset, cachedCursor: cursor } = selection;
            const activedNodes = new Set();
            if (anchorNode) {
                find.findActivedNodes(anchorNode, anchorOffset).forEach((node) => {
                    activedNodes.add(node);
                });
            }
            if (focusNode && (focusNode !== anchorNode || focusOffset !== anchorOffset)) {
                find.findActivedNodes(focusNode, focusNode).forEach((node) => {
                    activedNodes.add(node);
                });
            }
            if (activedNodes.size) {
                this._cacheActivedNodes.forEach((node) => {
                    node.classList.toggle(classNames.CLASS_NAMES.ME_NODE__ACTIVED, activedNodes.has(node));
                });
                activedNodes.forEach((node) => {
                    node.classList.toggle(classNames.CLASS_NAMES.ME_NODE__ACTIVED, true);
                });
                this._cacheActivedNodes = activedNodes;
            }
            else {
                this._cacheActivedNodes.forEach((node) => {
                    node.classList.toggle(classNames.CLASS_NAMES.ME_NODE__ACTIVED, false);
                });
                this._cacheActivedNodes.clear();
            }
            const { anchorBlock, isSameBlock } = cursor;
            if (!isSameBlock || !anchorBlock) {
                this.focusedBlock = null;
            }
            else {
                this.focusedBlock = anchorBlock;
            }
        });
    }
}

module.exports = MEContent;
