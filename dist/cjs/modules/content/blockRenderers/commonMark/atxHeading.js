/*!
 * meditable v0.2.1
 * Github: https://github.com/geekeditor/meditable
 * (c) 2023-2026 montisan <imontisan@gmail.com>
 * Released under the MIT License.
 */
'use strict';

var index = require('./paragraph/index.js');
var backspace = require('./paragraph/backspace.js');

class MEAtxHeading1Renderer extends index {
    static type = "atx-heading1";
    static tagName = 'h1';
    backspaceHandler(event) {
        const cursor = this.getCursor();
        if (!cursor) {
            return null;
        }
        const { start, end } = cursor;
        if (start.offset === 0 && end.offset === 0) {
            event.preventDefault();
            backspace.handleBackspaceInParagraph.call(this);
        }
        else {
            super.backspaceHandler(event);
        }
    }
}
class MEAtxHeading2Renderer extends MEAtxHeading1Renderer {
    static type = "atx-heading2";
    static tagName = 'h2';
}
class MEAtxHeading3Renderer extends MEAtxHeading1Renderer {
    static type = "atx-heading3";
    static tagName = 'h3';
}
class MEAtxHeading4Renderer extends MEAtxHeading1Renderer {
    static type = "atx-heading4";
    static tagName = 'h4';
}
class MEAtxHeading5Renderer extends MEAtxHeading1Renderer {
    static type = "atx-heading5";
    static tagName = 'h5';
}
class MEAtxHeading6Renderer extends MEAtxHeading1Renderer {
    static type = "atx-heading6";
    static tagName = 'h6';
}

exports.MEAtxHeading1Renderer = MEAtxHeading1Renderer;
exports.MEAtxHeading2Renderer = MEAtxHeading2Renderer;
exports.MEAtxHeading3Renderer = MEAtxHeading3Renderer;
exports.MEAtxHeading4Renderer = MEAtxHeading4Renderer;
exports.MEAtxHeading5Renderer = MEAtxHeading5Renderer;
exports.MEAtxHeading6Renderer = MEAtxHeading6Renderer;
