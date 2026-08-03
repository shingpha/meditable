/*!
 * meditable v0.2.1
 * Github: https://github.com/geekeditor/meditable
 * (c) 2023-2026 montisan <imontisan@gmail.com>
 * Released under the MIT License.
 */
import MELayout from './layout.js';
import MEEditable from './editable/index.js';
import MEEvent from './event.js';
import MECommand from './command.js';
import MEI18n from './i18n/index.js';
import MEContent from './content/index.js';
import MEClipboard from './clipboard/index.js';
import MEDragDrop from './dragdrop.js';
import MEState from './state/index.js';
import MEStack from './stack.js';
import MESearch from './search.js';
import MEPlugin from './plugin.js';

var Modules = {
    layout: MELayout,
    editable: MEEditable,
    event: MEEvent,
    command: MECommand,
    i18n: MEI18n,
    content: MEContent,
    clipboard: MEClipboard,
    dragdrop: MEDragDrop,
    state: MEState,
    stack: MEStack,
    search: MESearch,
    plugin: MEPlugin
};

export { Modules as default };
