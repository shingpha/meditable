/*!
 * meditable v0.2.1
 * Github: https://github.com/geekeditor/meditable
 * (c) 2023-2026 montisan <imontisan@gmail.com>
 * Released under the MIT License.
 */
import 'mathjax/es5/tex-mml-svg';
import { removeSVGUse } from './convert.js';

const MathJax = window.MathJax;
function tex2svgPromise(tex) {
    const mj = window.MathJax || MathJax;
    if (!mj || !mj.tex2svgPromise) {
        return Promise.reject(new Error('MathJax not ready'));
    }
    // Fix 1: 等待 MathJax startup.promise，避免浏览器异步未就绪时 tex2svgPromise 失败
    const ready = mj.startup && mj.startup.promise ? mj.startup.promise : Promise.resolve();
    return ready.then(() => mj.tex2svgPromise(tex)).then((node) => {
        const svg = node.querySelector('svg');
        if (svg) {
            removeSVGUse(svg);
            const html = svg.outerHTML;
            return html;
        }
        return '';
    });
}

export { tex2svgPromise };
