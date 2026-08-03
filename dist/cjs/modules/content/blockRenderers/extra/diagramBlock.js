/*!
 * meditable v0.2.1
 * Github: https://github.com/geekeditor/meditable
 * (c) 2023-2026 montisan <imontisan@gmail.com>
 * Released under the MIT License.
 */
'use strict';

var classNames = require('../../../../utils/classNames.js');
var htmlBlock = require('../commonMark/htmlBlock.js');
var index = require('../../../../utils/diagram/index.js');
var jsMd5 = require('js-md5');
var convert = require('../../../../utils/convert.js');
var utils = require('../../../../utils/utils.js');

class MEDiagramBlockRenderer extends htmlBlock {
    static type = "diagram-block";
    static htmlMap = new Map();
    static async staticRender({ data, diagramHtmlType }) {
        const code = data.text;
        const type = data.meta?.type;
        const key = jsMd5.md5(`${type}_${data.text}`);
        let innerHTML = "";
        if (this.htmlMap.has(key)) {
            innerHTML = this.htmlMap.get(key);
        }
        else {
            try {
                innerHTML = await index({ type, code, theme: 'hand' });
            }
            catch (error) {
            }
        }
        innerHTML = innerHTML && diagramHtmlType === 'img' ? `<img style="max-width: 100%" src="${convert.svgToDataURI(innerHTML)}" />` : innerHTML || '';
        return `<${this.tagName} class="${this.type} ${type}">${innerHTML}</${this.tagName}>`;
    }
    get type() {
        return this.meta.type;
    }
    get canExportImage() {
        return true;
    }
    updateContent() {
        const htmlMap = MEDiagramBlockRenderer.htmlMap;
        const code = this.text;
        const key = jsMd5.md5(`${this.type}_${this.text}`);
        let diagramHtml;
        if (code) {
            if (htmlMap.has(key)) {
                diagramHtml = htmlMap.get(key);
            }
            else {
                (async () => {
                    try {
                        diagramHtml = this.t("Loading...");
                        this.updatePreview(diagramHtml);
                        const html = await index({ type: this.type, code, target: this.previewContent, theme: 'hand' });
                        htmlMap.set(key, html);
                        // htmlMap.set(key, diagramHtml);
                    }
                    catch (err) {
                        diagramHtml = this.t("Invalid Diagram Code");
                    }
                })();
            }
        }
        else {
            diagramHtml = this.t("Empty Diagram");
        }
        this.updatePreview(diagramHtml);
        this.nodes.holder.dataset.role = this.type;
        return true;
    }
    async getSVG() {
        const htmlMap = MEDiagramBlockRenderer.htmlMap;
        const key = jsMd5.md5(`${this.type}_${this.text}`);
        const type = this.type;
        const code = this.text;
        let svg = "";
        if (htmlMap.has(key)) {
            svg = htmlMap.get(key);
        }
        else {
            try {
                svg = await index({ type, code, theme: 'hand' });
            }
            catch (error) {
            }
        }
        return svg;
    }
    async copyImage(event) {
        const svg = await this.getSVG();
        if (svg) {
            convert.svgToBlob(svg, 4).then((blob) => {
                if (blob) {
                    utils.copyBlob(blob).then(() => {
                        event.target.classList.toggle(classNames.CLASS_NAMES.ME_TOOL__SUCCESS, true);
                        setTimeout(() => {
                            event.target.classList.toggle(classNames.CLASS_NAMES.ME_TOOL__SUCCESS, false);
                        }, 1000);
                    });
                }
            });
        }
    }
    async downloadImage() {
        const svg = await this.getSVG();
        if (svg) {
            convert.svgToBlob(svg, 4).then((blob) => {
                if (blob) {
                    utils.saveToDisk("diagram-" + Date.now() + ".png", blob);
                }
            });
        }
    }
}

module.exports = MEDiagramBlockRenderer;
