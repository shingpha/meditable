/*!
 * meditable v0.2.1
 * Github: https://github.com/geekeditor/meditable
 * (c) 2023-2026 montisan <imontisan@gmail.com>
 * Released under the MIT License.
 */
import MEEm from './em.js';

class MESuperScript extends MEEm {
    static type = "sup";
    static tagName = "sup";
}

export { MESuperScript as default };
