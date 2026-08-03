/*!
 * meditable v0.2.1
 * Github: https://github.com/geekeditor/meditable
 * (c) 2023-2026 montisan <imontisan@gmail.com>
 * Released under the MIT License.
 */
'use strict';

var module$1 = require('./module.js');
var domUtils = require('../utils/domUtils.js');

class MECommand extends module$1 {
    commands;
    options;
    async prepare() {
        this.bindShortcutKeys();
        return true;
    }
    _hasEnterExecCommand;
    registerCommand(command) {
        if (typeof command === 'function') {
            command = command.apply(this);
        }
        if (!command) {
            return false;
        }
        this.commands = this.commands || {};
        if (!Array.isArray(command)) {
            command = [command];
        }
        command.forEach((cmd) => {
            this.commands[cmd.cmdName.toLowerCase()] = cmd;
            if (cmd.defaultOptions) {
                this.setOpt(cmd.defaultOptions);
            }
        });
        return true;
    }
    setOpt(opt, val) {
        let obj = {};
        if (typeof opt === 'string' && val) {
            obj[opt] = val;
        }
        else if (typeof opt === 'object') {
            obj = opt;
        }
        if (!this.options) {
            this.options = {};
        }
        Object.assign(this.options, obj);
    }
    getOpt(key) {
        return key && this.options && this.options[key];
    }
    command(cmdName) {
        return this.commands[cmdName];
    }
    execCommand(cmdName, ...args) {
        if (!cmdName) {
            return false;
        }
        let result;
        cmdName = cmdName.toLowerCase();
        const cmd = this.commands[cmdName];
        if (!cmd) {
            return false;
        }
        const { event } = this.instance.context;
        if (!this._hasEnterExecCommand) {
            this._hasEnterExecCommand = true;
            if (this.queryCommandState.apply(this, [cmdName, ...args]) !== -1) {
                event.trigger.apply(event, ["beforeexeccommand", cmdName, ...args]);
                result = this.callCmdFn("execCommand", arguments);
                event.trigger.apply(event, ["afterexeccommand", cmdName, ...args]);
            }
            this._hasEnterExecCommand = false;
        }
        else {
            result = this.callCmdFn('execCommand', arguments);
        }
        !this._hasEnterExecCommand && !cmd.ignoreContentChange && event.trigger('contentchange');
        !this._hasEnterExecCommand && !cmd.ignoreContentChange && event.selectionChange();
        return result;
    }
    queryCommandValue(cmd, ...args) {
        return this.callCmdFn('queryCommandValue', arguments);
    }
    queryCommandState(cmd, ...args) {
        return this.callCmdFn('queryCommandState', arguments);
    }
    queryCommandEnabled(cmd) {
        return this.callCmdFn('queryCommandEnabled', arguments);
    }
    queryCommandSupported(cmd) {
        return !!this.commands[cmd];
    }
    callCmdFn(fnName, args) {
        const cmdName = args[0].toLowerCase();
        const cmd = this.commands[cmdName];
        const cmdFn = cmd && cmd[fnName];
        args[0] = cmdName;
        if ((!cmd || !cmdFn) && fnName === "queryCommandState") {
            return false;
        }
        else if (cmdFn) {
            return cmdFn.apply(this, args);
        }
    }
    bindShortcutKeys() {
        const { editable } = this.instance.context;
        const handler = (e) => {
            const keyCode = e.keyCode || e.which;
            if (!keyCode) {
                return;
            }
            for (const cmdName in this.commands) {
                if (this.commands.hasOwnProperty(cmdName)) {
                    const shortcutKeys = this.commands[cmdName].shortcutKeys;
                    if (shortcutKeys) {
                        for (const key in shortcutKeys) {
                            if (shortcutKeys.hasOwnProperty(key)) {
                                const params = shortcutKeys[key];
                                if (/^(ctrl)(\+shift)?\+(.+)$/.test(key.toLowerCase()) ||
                                    /^(\w+)$/.test(key.toLowerCase())) {
                                    if (((RegExp.$1 === "ctrl" ? e.ctrlKey || e.metaKey : 0) &&
                                        (RegExp.$2 !== "" ? e.shiftKey : !e.shiftKey) &&
                                        keyCode === domUtils.keyCodes[RegExp.$3]) ||
                                        keyCode === domUtils.keyCodes[RegExp.$1]) {
                                        domUtils.preventDefault(e);
                                        if (params.handler) {
                                            params.handler.apply(this, [e, params.data]);
                                        }
                                        else {
                                            if (this.queryCommandState(cmdName, params.data) !== -1) {
                                                this.execCommand(cmdName, params.data);
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        };
        this.mutableListeners.on(editable.document, 'keydown', handler);
    }
}

module.exports = MECommand;
