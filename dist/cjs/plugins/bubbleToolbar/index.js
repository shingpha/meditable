/*!
 * meditable v0.2.1
 * Github: https://github.com/geekeditor/meditable
 * (c) 2023-2026 montisan <imontisan@gmail.com>
 * Released under the MIT License.
 */
'use strict';

var base = require('../base.js');
var utils = require('../../utils/utils.js');
var toolbar = require('./toolbar.js');
var buttons = require('./buttons.js');

class MEPluginBubbleToolbar extends base {
    static pluginName = 'bubbleToolbar';
    toolbar;
    items;
    cachedCursor = null;
    lastActiveMap = {};
    lastEnabledMap = {};
    updateScheduled;
    scrollListener;
    constructor(instance, options) {
        super(instance, options);
    }
    async prepare() {
        const opts = this.options;
        const showDelay = opts.showDelay ?? 150;
        const offset = opts.offset ?? 8;
        const cmdRegistry = this.instance.context.command.commands ?? {};
        const registeredCmds = new Set(Object.keys(cmdRegistry));
        this.items = buttons.resolveItems(opts.items, registeredCmds);
        const toolbarItems = this.items.map(it => ({
            cmdName: it.cmdName,
            tooltip: it.tooltip,
            icon: it.icon,
        }));
        this.toolbar = new toolbar(toolbarItems, {
            offset,
            onClick: (cmd) => this.execCmd(cmd),
        });
        this.updateScheduled = utils.debounce(() => this.handleSelectionChange(), showDelay);
        const { event } = this.instance.context;
        event.on('selectionchange', this.updateScheduled);
        event.on('mouseup', this.updateScheduled);
        event.on('keyup', this.updateScheduled);
        this.toolbar.rootEl.addEventListener('focusin', () => {
            if (!this.cachedCursor) {
                this.cachedCursor = this.instance.getCursor();
            }
        });
        this.toolbar.rootEl.addEventListener('focusout', (e) => {
            const next = e.relatedTarget;
            if (!next || !this.toolbar.rootEl.contains(next)) {
                this.cachedCursor = null;
            }
        });
        this.mutableListeners.on(this.instance.context.editable.document, 'keydown', (e) => {
            const ke = e;
            if (ke.key === 'Escape' && this.toolbar.visible) {
                this.toolbar.hide();
                this.cachedCursor = null;
                this.instance.context.editable.holder.focus();
            }
        });
        // Tab into the toolbar from the editor when toolbar is visible.
        // Capture phase so we run before the editor's own Tab (insertTab) handler.
        this.mutableListeners.on(this.instance.context.editable.document, 'keydown', (e) => {
            const ke = e;
            if (ke.key !== 'Tab' || ke.shiftKey)
                return;
            if (!this.toolbar.visible)
                return;
            if (this.toolbar.rootEl.contains(document.activeElement))
                return;
            this.cachedCursor = this.instance.getCursor();
            ke.preventDefault();
            ke.stopPropagation();
            this.toolbar.focusFirst();
        }, true);
        let rafId = 0;
        const onScrollOrResize = () => {
            if (rafId)
                return;
            rafId = requestAnimationFrame(() => {
                rafId = 0;
                if (this.toolbar.visible)
                    this.handleSelectionChange();
            });
        };
        window.addEventListener('scroll', onScrollOrResize, true);
        window.addEventListener('resize', onScrollOrResize);
        this.scrollListener = onScrollOrResize;
        return true;
    }
    handleSelectionChange() {
        const { editable, content } = this.instance.context;
        if (!editable.actived)
            return this.toolbar.hide();
        if (document.activeElement &&
            this.toolbar.rootEl.contains(document.activeElement)) {
            return; // keep visible while user is in the toolbar
        }
        const winSel = editable.window.getSelection();
        let range = null;
        if (winSel && winSel.rangeCount > 0) {
            try {
                range = winSel.getRangeAt(0);
            }
            catch { /* no range */ }
        }
        if (!range || range.collapsed)
            return this.toolbar.hide();
        const cursor = this.instance.getCursor();
        if (!cursor.anchorBlockId)
            return this.toolbar.hide();
        // Cross-block selection: format command only handles same-block, so don't
        // surface buttons that would silently no-op.
        if (cursor.focusBlockId && cursor.anchorBlockId !== cursor.focusBlockId) {
            return this.toolbar.hide();
        }
        const anchorBlock = content.queryBlock(cursor.anchorBlockId);
        // Fix 9: 沿父链向上找，任一祖先命中黑名单即隐藏（复杂块内层可编辑块不会直接命中）
        if (anchorBlock) {
            let blk = anchorBlock;
            while (blk) {
                if (buttons.BLACKLIST_BLOCK_TYPES.has(blk.type)) {
                    return this.toolbar.hide();
                }
                blk = blk.parent;
            }
        }
        let rect;
        try {
            rect = range.getBoundingClientRect();
            if (rect.width === 0 && rect.height === 0) {
                const rects = range.getClientRects();
                if (rects.length > 0)
                    rect = rects[0];
                else
                    return this.toolbar.hide();
            }
        }
        catch {
            return this.toolbar.hide();
        }
        this.lastActiveMap = buttons.getActiveMap(this.items, cursor, content.data);
        this.lastEnabledMap = buttons.getEnabledMap(this.items, cursor, content.data);
        this.toolbar.show(rect, this.lastActiveMap, this.lastEnabledMap);
    }
    execCmd(cmdName) {
        if (cmdName === '|')
            return;
        const inToolbar = !!(document.activeElement &&
            this.toolbar.rootEl.contains(document.activeElement));
        if (inToolbar && this.cachedCursor) {
            this.instance.setCursor(this.cachedCursor);
        }
        this.instance.context.command.execCommand(cmdName);
    }
    destroy() {
        if (this.scrollListener) {
            window.removeEventListener('scroll', this.scrollListener, true);
            window.removeEventListener('resize', this.scrollListener);
        }
        this.toolbar?.destroy();
        super.destroy();
    }
}

module.exports = MEPluginBubbleToolbar;
