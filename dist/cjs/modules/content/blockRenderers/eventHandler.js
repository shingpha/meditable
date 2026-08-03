/*!
 * meditable v0.2.1
 * Github: https://github.com/geekeditor/meditable
 * (c) 2023-2026 montisan <imontisan@gmail.com>
 * Released under the MIT License.
 */
'use strict';

var domUtils = require('../../../utils/domUtils.js');
var module$1 = require('../../module.js');

class MEEventHandler extends module$1 {
    isComposing = false;
    backspaceHandler(event) { }
    deleteHandler(event) { }
    enterHandler(event) { }
    arrowHandler(event) { }
    tabHandler(event) { }
    mouseDownHandler(event) { }
    clickHandler(event) { }
    keydownHandler(event) {
        switch (event.key) {
            case domUtils.keys.Backspace:
                this.backspaceHandler(event);
                break;
            case domUtils.keys.Delete:
                this.deleteHandler(event);
                break;
            case domUtils.keys.Enter:
                if (!this.isComposing) {
                    this.enterHandler(event);
                }
                break;
            case domUtils.keys.ArrowUp:
            case domUtils.keys.ArrowDown:
            case domUtils.keys.ArrowLeft:
            case domUtils.keys.ArrowRight:
                if (!this.isComposing) {
                    this.arrowHandler(event);
                }
                break;
            case domUtils.keys.Tab:
                this.tabHandler(event);
                break;
        }
    }
    keyupHandler(event) { }
    composeHandler(event) {
        this.isComposing = event.type === 'compositionstart';
        if (event.type === 'compositionend') {
            this.forceUpdate(event);
        }
    }
    inputHandler(event) {
        if (this.isComposing || event.isComposing || /historyUndo|historyRedo/.test(event.inputType)) {
            return;
        }
        this.forceUpdate(event);
    }
    forceUpdate(event) {
        throw (new Error('Inherit in subclasses'));
    }
}

module.exports = MEEventHandler;
