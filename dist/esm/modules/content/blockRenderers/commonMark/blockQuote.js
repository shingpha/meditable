/*!
 * meditable v0.2.1
 * Github: https://github.com/geekeditor/meditable
 * (c) 2023-2026 montisan <imontisan@gmail.com>
 * Released under the MIT License.
 */
import MEBlockRenderer from '../renderer.js';

class MEBlockQuoteRenderer extends MEBlockRenderer {
    static type = "block-quote";
    static tagName = 'blockquote';
}

export { MEBlockQuoteRenderer as default };
