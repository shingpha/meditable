/*!
 * meditable v0.2.1
 * Github: https://github.com/geekeditor/meditable
 * (c) 2023-2026 montisan <imontisan@gmail.com>
 * Released under the MIT License.
 */
import MEParagraphRenderer from './paragraph/index.js';

class MESetextHeading1Renderer extends MEParagraphRenderer {
    static type = "setext-heading1";
    static tagName = 'h1';
}
class MESetextHeading2Renderer extends MEParagraphRenderer {
    static type = "setext-heading2";
    static tagName = 'h2';
}

export { MESetextHeading1Renderer, MESetextHeading2Renderer };
