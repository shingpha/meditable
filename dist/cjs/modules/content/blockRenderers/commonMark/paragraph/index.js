/*!
 * meditable v0.2.1
 * Github: https://github.com/geekeditor/meditable
 * (c) 2023-2026 montisan <imontisan@gmail.com>
 * Released under the MIT License.
 */
'use strict';

var renderer = require('../../renderer.js');
var patch = require('../../../utils/patch.js');
var classNames = require('../../../../../utils/classNames.js');
var tab = require('./tab.js');
var backspace = require('./backspace.js');
var enter = require('./enter.js');

class MEParagraphRenderer extends renderer.default {
    static type = "paragraph";
    static tagName = 'p';
    _datas = [];
    _isInlineRendered = false;
    get dirty() {
        const childNodes = Array.from(this.nodes.holder.childNodes);
        return childNodes.some((node) => node.nodeType === 3) || (this.children || []).some((node) => node.dirty);
    }
    updateContent(checkUpdate) {
        if (!this.nodes.el) {
            this.nodes.el = this.make(this.tagName);
            this.nodes.holder = this.make('span', [classNames.CLASS_NAMES.ME_EDITABLE], { contenteditable: 'true' });
            this.nodes.el.appendChild(this.nodes.holder);
        }
        this.updateChildren(checkUpdate);
        return this._isInlineRendered;
    }
    updateChildren(checkUpdate) {
        const datas = this.tokenizer();
        this._isInlineRendered = false;
        if (!checkUpdate || (patch.checkNotSameDatas(this._datas, datas) || this.dirty || this.nodes.holder.childNodes.length !== datas.length)) {
            const cursor = this.renderCursor;
            if (cursor?.anchorBlock === this.block || cursor?.anchorBlockId === this.block.id) {
                const anchorOffset = cursor.anchor.offset;
                datas.forEach((d) => {
                    if (d.range.start <= anchorOffset && anchorOffset <= d.range.end) {
                        d.actived = true;
                    }
                });
            }
            if ((cursor?.focusBlock === this.block || cursor?.focusBlockId === this.block.id) && (cursor.focusBlock !== cursor.anchorBlock || cursor.focus.offset !== cursor.anchor.offset)) {
                const focusOffset = cursor.focus.offset;
                datas.forEach((d) => {
                    if (d.range.start <= focusOffset && focusOffset <= d.range.end) {
                        d.actived = true;
                    }
                });
            }
            patch.inlinePatch.call(this, datas);
            this._isInlineRendered = true;
        }
        this._datas = datas;
    }
    paragraphParentType() {
        if (this.block.type !== 'paragraph') {
            return;
        }
        let { parent } = this.block;
        let type = 'paragraph';
        while (parent && parent.parent) {
            if (parent.type === 'block-quote' ||
                parent.type === 'list-item' ||
                parent.type === 'task-list-item') {
                type = parent.type;
                break;
            }
            parent = parent.parent;
        }
        return type;
    }
    enterHandler(event) {
        this.scrollToView();
        if (event.shiftKey) {
            return this.shiftEnterHandler(event);
        }
        const type = this.paragraphParentType();
        let handled = enter.enterConvert.call(this, event);
        if (!handled) {
            if (type === 'block-quote') {
                handled = enter.enterInBlockQuote.call(this, event);
            }
            else if (type === 'list-item' || type === 'task-list-item') {
                handled = enter.enterInListItem.call(this, event);
            }
        }
        if (!handled) {
            super.enterHandler(event);
        }
    }
    backspaceHandler(event) {
        const cursor = this.getCursor();
        if (!cursor) {
            return null;
        }
        const { start, end } = cursor;
        if (start.offset === 0 && end.offset === 0) {
            event.preventDefault();
            const type = this.paragraphParentType();
            switch (type) {
                case 'paragraph':
                    return backspace.handleBackspaceInParagraph.call(this);
                case 'block-quote':
                    return backspace.handleBackspaceInBlockQuote.call(this);
                case 'list-item':
                case 'task-list-item':
                    return backspace.handleBackspaceInList.call(this);
            }
        }
        else {
            super.backspaceHandler(event);
        }
    }
    tabHandler(event) {
        // disable tab focus
        event.preventDefault();
        const cursor = this.getCursor();
        if (!cursor) {
            return null;
        }
        const { start, end } = cursor;
        if (event.shiftKey) {
            const unindentType = tab.isUnindentableListItem.call(this);
            if (unindentType) {
                tab.unindentListItem.call(this, unindentType);
            }
            return;
        }
        // Handle `tab` to jump to the end of format when the cursor is at the end of format content.
        if (start.offset === end.offset) {
            const atEnd = tab.checkCursorAtEndFormat.call(this);
            if (atEnd) {
                const offset = start.offset + atEnd.offset;
                return this.setCursor({ focus: { offset } });
            }
        }
        if (tab.isIndentableListItem.call(this)) {
            return tab.indentListItem.call(this);
        }
        return tab.insertTab.call(this);
    }
}

module.exports = MEParagraphRenderer;
