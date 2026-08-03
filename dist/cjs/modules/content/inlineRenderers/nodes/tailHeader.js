/*!
 * meditable v0.2.1
 * Github: https://github.com/geekeditor/meditable
 * (c) 2023-2026 montisan <imontisan@gmail.com>
 * Released under the MIT License.
 */
'use strict';

var node = require('./node.js');
var classNames = require('../../../../utils/classNames.js');

class METailHeader extends node {
    static type = "tail_header";
    renderSelf(data) {
        const { raw } = data;
        if (!this.nodes.el) {
            this.nodes.el = this.make("span", [classNames.CLASS_NAMES.ME_NODE]);
            this.nodes.el.innerHTML = `<span class="${classNames.CLASS_NAMES.ME_TAIL_HEADER}" spellcheck="false">`;
            this.nodes.el.dataset.nodeType = this.type;
        }
        if (raw !== this.nodes.el.firstChild.textContent) {
            this.nodes.el.firstChild.textContent = raw || '';
        }
    }
}

module.exports = METailHeader;
