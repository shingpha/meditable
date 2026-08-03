/*!
 * meditable v0.2.1
 * Github: https://github.com/geekeditor/meditable
 * (c) 2023-2026 montisan <imontisan@gmail.com>
 * Released under the MIT License.
 */
import MEParagraphRenderer from './paragraph/index.js';
import { handleBackspaceInParagraph } from './paragraph/backspace.js';

class MEAtxHeading1Renderer extends MEParagraphRenderer {
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
            handleBackspaceInParagraph.call(this);
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

export { MEAtxHeading1Renderer, MEAtxHeading2Renderer, MEAtxHeading3Renderer, MEAtxHeading4Renderer, MEAtxHeading5Renderer, MEAtxHeading6Renderer };
