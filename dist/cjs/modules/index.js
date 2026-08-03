/*!
 * meditable v0.2.1
 * Github: https://github.com/geekeditor/meditable
 * (c) 2023-2026 montisan <imontisan@gmail.com>
 * Released under the MIT License.
 */
'use strict';

var layout = require('./layout.js');
var index = require('./editable/index.js');
var event = require('./event.js');
var command = require('./command.js');
var index$1 = require('./i18n/index.js');
var index$2 = require('./content/index.js');
var index$3 = require('./clipboard/index.js');
var dragdrop = require('./dragdrop.js');
var index$4 = require('./state/index.js');
var stack = require('./stack.js');
var search = require('./search.js');
var plugin = require('./plugin.js');

var Modules = {
    layout,
    editable: index,
    event,
    command,
    i18n: index$1,
    content: index$2,
    clipboard: index$3,
    dragdrop,
    state: index$4,
    stack,
    search,
    plugin
};

module.exports = Modules;
