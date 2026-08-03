/*!
 * meditable v0.2.1
 * Github: https://github.com/geekeditor/meditable
 * (c) 2023-2026 montisan <imontisan@gmail.com>
 * Released under the MIT License.
 */
'use strict';

var turndownService = require('../../utils/turndownService.js');
var TurndownService = require('turndown');

// Just because turndown change `\n`(soft line break) to space, So we add `span.ag-soft-line-break` to workaround.
const turnSoftBreakToSpan = (html) => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(`<x-mt id="turn-root">${html}</x-mt>`, "text/html");
    const root = doc.querySelector("#turn-root");
    const travel = (childNodes) => {
        for (const node of childNodes) {
            if (node.nodeType === 3 && node.parentNode.tagName !== "CODE") {
                let startLen = 0;
                let endLen = 0;
                const text = node.nodeValue
                    .replace(/^(\n+)/, (_, p) => {
                    startLen = p.length;
                    return "";
                })
                    .replace(/(\n+)$/, (_, p) => {
                    endLen = p.length;
                    return "";
                });
                if (/\n/.test(text)) {
                    const tokens = text.split("\n");
                    const params = [];
                    let i = 0;
                    const len = tokens.length;
                    for (; i < len; i++) {
                        let text = tokens[i];
                        if (i === 0 && startLen !== 0) {
                            text = "\n".repeat(startLen) + text;
                        }
                        else if (i === len - 1 && endLen !== 0) {
                            text = text + "\n".repeat(endLen);
                        }
                        params.push(document.createTextNode(text));
                        if (i !== len - 1) {
                            const softBreak = document.createElement("span");
                            softBreak.classList.add("mu-soft-line-break");
                            params.push(softBreak);
                        }
                    }
                    node.replaceWith(...params);
                }
            }
            else if (node.nodeType === 1) {
                travel(node.childNodes);
            }
        }
    };
    travel(root.childNodes);
    return root.innerHTML.trim();
};
class HtmlToMarkdown {
    options = {};
    constructor(options = {}) {
        this.options = Object.assign({}, turndownService.DEFAULT_TURNDOWN_CONFIG, options);
    }
    generate(html, keeps = []) {
        // turn html to markdown
        const { options } = this;
        const turndownService$1 = new TurndownService(options);
        turndownService.addPluginAddRules(turndownService$1, keeps);
        // fix #752, but I don't know why the &nbsp; vanlished.
        html = html.replace(/<span>&nbsp;<\/span>/g, String.fromCharCode(160));
        html = turnSoftBreakToSpan(html);
        const markdown = turndownService$1.turndown(html);
        return markdown;
    }
}

module.exports = HtmlToMarkdown;
