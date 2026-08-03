/*!
 * meditable v0.2.1
 * Github: https://github.com/geekeditor/meditable
 * (c) 2023-2026 montisan <imontisan@gmail.com>
 * Released under the MIT License.
 */
import MEBlockRenderer from '../renderer.js';

class MEFrontmatterRenderer extends MEBlockRenderer {
    static type = "frontmatter";
    static tagName = 'pre';
    forceUpdate() {
        const codeRendererer = this.block.lastContentInDescendant().renderer;
        const text = codeRendererer.text;
        this.render({ text });
    }
}

export { MEFrontmatterRenderer as default };
