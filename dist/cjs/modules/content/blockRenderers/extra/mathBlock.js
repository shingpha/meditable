/*!
 * meditable v0.2.1
 * Github: https://github.com/geekeditor/meditable
 * (c) 2023-2026 montisan <imontisan@gmail.com>
 * Released under the MIT License.
 */
'use strict';

var katex = require('katex');
var htmlBlock = require('../commonMark/htmlBlock.js');
var jsMd5 = require('js-md5');
var math = require('../../../../utils/math.js');
var convert = require('../../../../utils/convert.js');
var utils = require('../../../../utils/utils.js');
var classNames = require('../../../../utils/classNames.js');

class MEMathBlockRenderer extends htmlBlock {
    static type = "math-block";
    static mathMap = new Map();
    static mathMap2 = new Map();
    static async staticRender({ data }) {
        const math$1 = data.text;
        const key = jsMd5.md5(math$1);
        let mathHtml = "";
        if (this.mathMap2.has(key)) {
            mathHtml = this.mathMap2.get(key);
        }
        else {
            // Fix 1: 块公式优先用 KaTeX displayMode 渲染（浏览器稳定、同步），失败再回退 MathJax
            try {
                mathHtml = katex.renderToString(math$1, {
                    displayMode: true,
                    throwOnError: false,
                });
                this.mathMap2.set(math$1, mathHtml);
            }
            catch (error) {
                try {
                    mathHtml = await math.tex2svgPromise(math$1);
                    this.mathMap2.set(math$1, mathHtml);
                }
                catch (e) {
                }
            }
        }
        return `<${this.tagName} class="${this.type}">${mathHtml || ''}</${this.tagName}>`;
    }
    get canExportImage() {
        return true;
    }
    updateContent() {
        const mathMap = MEMathBlockRenderer.mathMap;
        const math = this.text;
        const key = jsMd5.md5(math);
        let mathHtml;
        if (mathMap.has(key)) {
            mathHtml = mathMap.get(key);
        }
        else {
            try {
                // Fix 1: 块级公式用 displayMode: true
                mathHtml = katex.renderToString(math, {
                    displayMode: true,
                    throwOnError: false,
                });
                mathMap.set(key, mathHtml);
            }
            catch (err) {
                mathHtml = "Invalid Mathematical Formula";
            }
        }
        this.updatePreview(mathHtml);
        return true;
    }
    async getSVG() {
        const math$1 = this.text;
        let svg = "";
        try {
            svg = await math.tex2svgPromise(math$1);
        }
        catch (error) {
        }
        return svg;
    }
    async copyImage(event) {
        const svg = await this.getSVG();
        if (svg) {
            convert.svgToBlob(svg).then((blob) => {
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
            convert.svgToBlob(svg).then((blob) => {
                if (blob) {
                    utils.saveToDisk("math-" + Date.now() + ".png", blob);
                }
            });
        }
    }
}

module.exports = MEMathBlockRenderer;
