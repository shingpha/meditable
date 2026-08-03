/*!
 * meditable v0.2.1
 * Github: https://github.com/geekeditor/meditable
 * (c) 2023-2026 montisan <imontisan@gmail.com>
 * Released under the MIT License.
 */
'use strict';

var module$1 = require('./module.js');
var utils = require('../utils/utils.js');

function compareCursors(cursorA, cursorB) {
    return cursorA.anchorBlockId === cursorB.anchorBlockId &&
        cursorA.focusBlockId === cursorB.focusBlockId &&
        cursorA.anchor.offset === cursorB.anchor.offset &&
        cursorA.focus.offset === cursorB.focus.offset;
}
function compareObjects(objectA, objectB) {
    if (!objectA && !objectB) {
        return true;
    }
    objectA = objectA || {};
    objectB = objectB || {};
    if (Object.keys(objectA).length !== Object.keys(objectB).length) {
        return false;
    }
    for (const key in objectA) {
        if (!objectB.hasOwnProperty(key))
            return false;
        if (typeof objectA[key] === 'object' && typeof objectB[key] === 'object') {
            const result = compareObjects(objectA[key], objectB[key]);
            if (!result)
                return false;
        }
        else if (objectA[key] !== objectB[key]) {
            return false;
        }
    }
    return true;
}
function compareStates(stateA, stateB) {
    if (stateA.id !== stateB.id || stateA.type !== stateB.type || stateA.text !== stateB.text || !compareObjects(stateA.meta, stateB.meta)) {
        return false;
    }
    const lenA = stateA.children?.length;
    const lenB = stateB.children?.length;
    if (lenA !== lenB) {
        return false;
    }
    if (lenA) {
        for (let i = 0; i < lenA; i++) {
            if (!compareStates(stateA.children[i], stateB.children[i])) {
                return false;
            }
        }
    }
    return true;
}
function isInvalidCursor(cursor) {
    return (!cursor.anchorBlockId && !cursor.focusBlockId);
}
const keys = {
    /*Shift*/
    16: 1,
    /*Ctrl*/
    17: 1,
    /*Alt*/
    18: 1,
    37: 1,
    38: 1,
    39: 1,
    40: 1,
};
class MEStack extends module$1 {
    _list = [];
    _index = 0;
    _canUndo = false;
    _canRedo = false;
    _maxStackCount;
    _maxInputCount;
    _keyCount;
    _compositing;
    _isCollapsed;
    _saveFn;
    _mutationObserver;
    async prepare() {
        this._maxStackCount = 50;
        this._maxInputCount = 20;
        this._keyCount = 0;
        this._compositing = false;
        this._isCollapsed = true;
        this._saveFn = utils.debounce(this.save, 200);
        // this._mutationObserver = new MutationObserver(()=>{
        //     this._saveFn(true);
        // });
        // this.reset();
        this.bindEvents();
        const commands = [
            {
                cmdName: 'undo',
                notNeedUndo: true,
                execCommand: (cmdName) => {
                    this.undo();
                },
                queryCommandState: () => {
                    return this.canUndo() ?
                        0 :
                        -1;
                },
                shortcutKeys: {
                    "Ctrl+Z": {}
                }
            },
            {
                cmdName: 'redo',
                notNeedUndo: true,
                execCommand: (cmdName) => {
                    this.redo();
                },
                queryCommandState: () => {
                    return this.canRedo() ?
                        0 :
                        -1;
                },
                shortcutKeys: {
                    "Ctrl+Y": {},
                    "Ctrl+Shift+Z": {}
                }
            }
        ];
        for (let key in commands) {
            this.instance.context.command.registerCommand(commands[key]);
        }
        return true;
    }
    bindEvents() {
        const { editable, event } = this.instance.context;
        event.on('compositionstart', (type, evt) => {
            this._compositing = true;
        });
        event.on('compositionend', (type, evt) => {
            this._compositing = false;
            this._saveFn(false);
        });
        event.on('keydown', (type, evt) => {
            const keyCode = evt.keyCode || evt.which;
            if (!keys[keyCode] &&
                !evt.ctrlKey &&
                !evt.metaKey &&
                !evt.shiftKey &&
                !evt.altKey) {
                if (this._compositing)
                    return;
                if (!editable.selection.getRangeAt(0).collapsed) {
                    this._saveFn(true);
                    this._isCollapsed = false;
                    return;
                }
                if (this._list.length === 0) {
                    this.save(true);
                }
                this._saveFn(true);
                // this._keyCount++;
                // if (this._keyCount >= this._maxInputCount) {
                //     this.save(true);
                // }
            }
        });
        event.on('keyup', (type, evt) => {
            const keyCode = evt.keyCode || evt.which;
            if (!keys[keyCode] &&
                !evt.ctrlKey &&
                !evt.metaKey &&
                !evt.shiftKey &&
                !evt.altKey) {
                if (this._compositing)
                    return;
                if (!this._isCollapsed) {
                    this.save(true);
                    this._isCollapsed = true;
                }
            }
        });
        event.on('mouseup', (type, evt) => {
            this.save(true);
        });
        event.on('beforeexeccommand', (type, cmdName) => {
            this.saveForCmd(cmdName);
        });
        event.on('afterexeccommand', (type, cmdName) => {
            this.saveForCmd(cmdName);
        });
        event.on('savescence', (type) => {
            this.save(true);
        });
        // this._mutationObserver.observe(
        //     editable.holder,
        //     {
        //         childList: true,
        //         subtree: true,
        //         characterData: true,
        //         attributes: true,
        //     }
        // );
    }
    saveForCmd(cmdName) {
        const { command } = this.instance.context;
        const com = command.command(cmdName);
        if (com && !com.notNeedUndo) {
            this.save(true);
        }
    }
    undo() {
        if (this._canUndo) {
            if (!this._list[this._index - 1] && this._list.length == 1) {
                this.reset();
                return;
            }
            while (this._list[this._index].state === this._list[this._index - 1].state) {
                this._index--;
                if (this._index === 0) {
                    return this.restore(0);
                }
            }
            this.restore(--this._index);
        }
    }
    redo() {
        if (this._canRedo) {
            while (this._list[this._index].state === this._list[this._index + 1].state) {
                this._index++;
                if (this._index === this._list.length - 1) {
                    return this.restore(this._index);
                }
            }
            this.restore(++this._index);
        }
    }
    restore(index) {
        const { state } = this.instance.context;
        const scene = this._list[index];
        state.setScene(scene);
        this.update();
        this.clearKey();
    }
    save(notCompareCursor) {
        const { event, state } = this.instance.context;
        const currentScene = state.getScene();
        const lastScene = this._list[this._index];
        const isSame = lastScene && compareStates(lastScene.state, currentScene.state);
        if (!isSame) {
            event.trigger('contentchange', currentScene);
        }
        if (isSame && (notCompareCursor || isInvalidCursor(currentScene.cursor) || compareCursors(lastScene.cursor, currentScene.cursor))) {
            return;
        }
        this._list = this._list.slice(0, this._index + 1);
        this._list.push(currentScene);
        if (this._list.length > this._maxStackCount) {
            this._list.shift();
        }
        this._index = this._list.length - 1;
        this.update();
        this.clearKey();
    }
    update() {
        this._canRedo = !!this._list[this._index + 1];
        this._canUndo = !!this._list[this._index - 1];
    }
    reset() {
        const { state } = this.instance.context;
        const currentScene = state.getScene();
        this._list = [currentScene];
        this._index = 0;
        this._canRedo = false;
        this._canUndo = false;
    }
    clearKey() {
        this._keyCount = 0;
    }
    canUndo() {
        return this._canUndo;
    }
    canRedo() {
        return this._canRedo;
    }
}

module.exports = MEStack;
