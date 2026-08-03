import "mathjax/es5/tex-mml-svg";
import { removeSVGUse } from "./convert";
const MathJax: any = (window as any).MathJax;

export function tex2svgPromise(tex: string): Promise<string> {
    const mj: any = (window as any).MathJax || MathJax;
    if (!mj || !mj.tex2svgPromise) {
        return Promise.reject(new Error('MathJax not ready'));
    }
    // Fix 1: 等待 MathJax startup.promise，避免浏览器异步未就绪时 tex2svgPromise 失败
    const ready = mj.startup && mj.startup.promise ? mj.startup.promise : Promise.resolve();
    return ready.then(() => mj.tex2svgPromise(tex)).then((node: HTMLElement) => {
        const svg = node.querySelector('svg');
        if(svg) {
            removeSVGUse(svg)
            const html = svg.outerHTML;
            return html;
        }

        return ''
    })
}

export async function renderMath(tex: string, target: HTMLElement): Promise<string> {
    const html = await tex2svgPromise(tex);
    target.innerHTML = html;
    return html;
}