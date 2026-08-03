/*!
 * meditable v0.2.1
 * Github: https://github.com/geekeditor/meditable
 * (c) 2023-2026 montisan <imontisan@gmail.com>
 * Released under the MIT License.
 */
import MEBlockRenderer from '../renderer.js';
import { CLASS_NAMES } from '../../../../utils/classNames.js';
import { canCopyBlob } from '../../../../utils/utils.js';

class MEHtmlBlockRenderer extends MEBlockRenderer {
    static type = "html-block";
    static tagName = 'figure';
    static async staticRender({ data }) {
        const innerHTML = data.text;
        const lang = data.children[0]?.meta?.lang;
        return `<${this.tagName} class="${this.type} ${lang}">${innerHTML || ''}</${this.tagName}>`;
    }
    get preview() {
        return this.nodes.el.firstElementChild;
    }
    get previewContent() {
        return this.preview?.firstElementChild;
    }
    get canExportImage() {
        return false;
    }
    clickPreviewHandler(event) {
        event.preventDefault();
        event.stopPropagation();
        const { target } = event;
        if (target.closest(`.${CLASS_NAMES.ME_TOOL}, .${CLASS_NAMES.ME_TOOLBAR}`)) {
            return;
        }
        const cursorBlock = this.block.firstContentInDescendant();
        cursorBlock.renderer.setCursor();
    }
    // mouseDownPreviewHandler(event) {
    //     event.preventDefault()
    // }
    updatePreview(html) {
        if (!this.nodes.el) {
            this.nodes.el = this.make(this.tagName);
            this.nodes.el.appendChild(this.make('div', [CLASS_NAMES.ME_PREVIEW], {
                spellcheck: 'false',
                contenteditable: 'false'
            }));
            this.nodes.holder = this.make('pre', [CLASS_NAMES.ME_CONTAINER]);
            this.nodes.el.appendChild(this.nodes.holder);
            // this.mutableListeners.on(this.preview, 'mousedown', this.mouseDownPreviewHandler.bind(this))
            this.mutableListeners.on(this.preview, 'click', this.clickPreviewHandler.bind(this));
            this.preview.appendChild(this.make('div', [CLASS_NAMES.ME_PREVIEW_CONTENT], {
                spellcheck: 'false',
                contenteditable: 'false'
            }));
            if (this.canExportImage) {
                const toolbar = this.make('span', [CLASS_NAMES.ME_TOOLBAR]);
                this.preview.appendChild(toolbar);
                if (canCopyBlob()) {
                    const copyIcon = this.make('span', [CLASS_NAMES.ME_TOOL, CLASS_NAMES.ME_TOOL__COPY]);
                    toolbar.appendChild(copyIcon);
                    this.mutableListeners.on(copyIcon, 'click', this.copyImage.bind(this));
                }
                const downloadIcon = this.make('span', [CLASS_NAMES.ME_TOOL, CLASS_NAMES.ME_TOOL__DOWNLOAD]);
                toolbar.appendChild(downloadIcon);
                this.mutableListeners.on(downloadIcon, 'click', this.downloadImage.bind(this));
            }
        }
        this.previewContent.innerHTML = html;
    }
    updateContent() {
        this.updatePreview(this.text);
        return true;
    }
    forceUpdate() {
        const codeRendererer = this.block.lastContentInDescendant().renderer;
        const text = codeRendererer.text;
        this.render({ text });
    }
    copyImage(event) {
    }
    downloadImage(event) {
    }
}

export { MEHtmlBlockRenderer as default };
