/*!
 * meditable v0.2.1
 * Github: https://github.com/geekeditor/meditable
 * (c) 2023-2026 montisan <imontisan@gmail.com>
 * Released under the MIT License.
 */
import MEBlockRenderer from '../renderer.js';

class MEListItemRenderer extends MEBlockRenderer {
    static type = "list-item";
    static tagName = 'li';
}

export { MEListItemRenderer as default };
