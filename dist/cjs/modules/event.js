/*!
 * meditable v0.2.1
 * Github: https://github.com/geekeditor/meditable
 * (c) 2023-2026 montisan <imontisan@gmail.com>
 * Released under the MIT License.
 */
'use strict';

var classNames = require('../utils/classNames.js');
var module$1 = require('./module.js');
var utils = require('../utils/utils.js');

class MEEvent extends module$1 {
    listeners;
    async prepare() {
        this.bindEvents();
        return true;
    }
    bindEvents() {
        this.proxyDomEvent = this.proxyDomEvent.bind(this);
        this.selectionChange = utils.debounce(this.selectionChange, 20);
        const { editable, layout } = this.instance.context;
        [
            "keydown",
            "keyup",
            "keypress",
            "input",
            "selectstart",
            "focus",
            "blur",
            "compositionstart",
            "compositionend"
        ].forEach((type) => {
            this.mutableListeners.on(editable.holder, type, this.proxyDomEvent);
        });
        [
            "copy",
            "cut",
            "paste"
        ].forEach((type) => {
            this.mutableListeners.on(editable.holder, type, this.proxyDomEvent);
        });
        [
            "click",
            "contextmenu",
            "mousedown",
            "mouseup",
            "mouseover",
            "mouseout",
            "drop",
            "dragstart",
            "dragover"
        ].forEach((type) => {
            this.mutableListeners.on(layout.nodes.scroller, type, this.proxyDomEvent);
        });
        const selectionChangeEvent = (evt) => {
            if (evt.button === 2)
                return;
            this.selectionChange(evt);
        };
        ["mouseup", "keydown"].forEach((type) => {
            this.mutableListeners.on(editable.holder, type, selectionChangeEvent);
        });
        // Maybe move mouse out of holder
        this.mutableListeners.on(editable.document, 'mouseup', selectionChangeEvent);
        this.mutableListeners.on(editable.document, 'selectionchange', selectionChangeEvent);
        const preventSelection = (event) => {
            const { target } = event;
            if (target.closest(`.${classNames.CLASS_NAMES.ME_TOOL}, .${classNames.CLASS_NAMES.ME_TOOLBAR}, .${classNames.CLASS_NAMES.ME_PREVIEW}`)) {
                event.preventDefault();
                return;
            }
        };
        this.mutableListeners.on(editable.document, 'mousedown', preventSelection);
    }
    proxyDomEvent(evt) {
        const type = evt.type.replace(/^on/, "").toLowerCase();
        this.trigger(type, evt);
    }
    selectionChange(evt) {
        if (!this.instance) {
            return;
        }
        const causeByUi = !!evt;
        const { selection } = this.instance.context.editable;
        selection.cache();
        if (selection.cachedRange && selection.cachedCursor) {
            this.trigger("beforeselectionchange");
            this.trigger("selectionchange", causeByUi);
            this.trigger("afterselectionchange");
            // selection.clearCache();
        }
    }
    getListener(type) {
        this.listeners = this.listeners || {};
        return this.listeners[type] || (this.listeners[type] = []);
    }
    on(types, listener) {
        if (typeof types === 'string') {
            types = types.trim().split(/\s+/);
        }
        for (const type of types) {
            const listeners = this.getListener(type), index = listeners.findIndex((l) => l === listener);
            if (index === -1) {
                listeners.push(listener);
            }
        }
    }
    off(types, listener) {
        if (typeof types === 'string') {
            types = types.trim().split(/\s+/);
        }
        for (const type of types) {
            const listeners = this.getListener(type), index = listeners.findIndex((l) => l === listener);
            if (index !== -1) {
                listeners.splice(index, 1);
            }
        }
    }
    trigger(types, ...args) {
        if (typeof types === 'string') {
            types = types.trim().split(/\s+/);
        }
        for (const type of types) {
            const listeners = this.getListener(type);
            const tagrs = [type, ...args];
            listeners.forEach((listener) => {
                listener.apply(this, tagrs);
            });
        }
    }
}

module.exports = MEEvent;
