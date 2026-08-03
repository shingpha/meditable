import sanitize, { PREVIEW_DOMPURIFY_CONFIG } from "./dompurify";
import { PARAGRAPH_TYPES } from "./nodeTypes";
// Fix 10: 粘贴 Word 片段前预处理（style→语义标签、MathML→LaTeX）。详见 patch-meditable.mjs
import { MathMLToLaTeX } from "mathml-to-latex";

// Fix 10: 粘贴 Word 片段前预处理（style→语义标签、MathML→LaTeX、Word 标题/列表）
function preprocessWordPaste(html: string): string {
    if (!html || typeof html !== "string") return html;
    let doc: Document;
    try {
        doc = new DOMParser().parseFromString("<body>" + html + "</body>", "text/html");
    } catch (e) {
        return html;
    }
    const body = doc.body || (doc.documentElement as any);
    if (!body) return html;
    // 1) 内联样式 → 语义标签（加粗 / 斜体 / 下划线 / 删除线）
    const all: any[] = Array.from(body.querySelectorAll("*"));
    for (const el of all) {
        const style = (el as any).getAttribute && (el as any).getAttribute("style");
        if (!style) continue;
        const fw = /font-weight\s*:\s*(bold|[6-9]00|1[0-9]00)/i.test(style);
        const fi = /font-style\s*:\s*italic/i.test(style);
        const fu = /text-decoration\s*:\s*underline/i.test(style);
        const fs = /text-decoration\s*:\s*line-through/i.test(style);
        if (!fw && !fi && !fu && !fs) continue;
        const wrappers: string[] = [];
        if (fw && !(el as any).closest("strong,b")) wrappers.push("strong");
        if (fi && !(el as any).closest("em,i")) wrappers.push("em");
        if (fu && !(el as any).closest("u")) wrappers.push("u");
        if (fs && !(el as any).closest("s,del,strike")) wrappers.push("s");
        if (!wrappers.length) continue;
        let outer: any = null;
        let inner: any = null;
        for (let k = wrappers.length - 1; k >= 0; k--) {
            const w = doc.createElement(wrappers[k]);
            if (outer) w.appendChild(outer);
            outer = w;
            if (!inner) inner = w;
        }
        while (el.firstChild) inner.appendChild(el.firstChild);
        el.replaceWith(outer);
    }
    // 1.5) Word 标题：<p class="MsoHeadingN"> / <p style="mso-outline-level:N"> → <hN>
    const topParas: any[] = Array.from(body.children).filter((c: any) => c.tagName === "P");
    for (const p of topParas) {
        if (/^H[1-6]$/.test(p.tagName)) continue;
        const cls = (p as any).getAttribute("class") || "";
        const style = (p as any).getAttribute("style") || "";
        const styleName = (style.match(/mso-style-name\s*:\s*([^;"]+)/i) || [])[1] || "";
        let level = 0;
        let m = /MsoHeading\s*(\d)/i.exec(cls);
        if (m) level = parseInt(m[1], 10);
        if (!level) { m = /mso-outline-level\s*:\s*(\d)/i.exec(style); if (m) level = parseInt(m[1], 10); }
        if (!level) { m = /(?:heading|标题)\s*(\d)/i.exec(styleName); if (m) level = parseInt(m[1], 10); }
        if (level >= 1 && level <= 6) {
            const h = doc.createElement("h" + level);
            while (p.firstChild) h.appendChild(p.firstChild);
            p.replaceWith(h);
        }
    }
    // 1.6) Word 列表：连续 <p style="mso-list:..."> 归并为 <ul>/<ol> + <li>
    const kids = Array.from(body.children);
    let li = 0;
    while (li < kids.length) {
        const p: any = kids[li];
        const pstyle = (p.getAttribute && p.getAttribute("style")) || "";
        const isList = p.tagName === "P" && !/^H[1-6]$/.test(p.tagName) && /mso-list\s*:/i.test(pstyle);
        if (!isList) { li++; continue; }
        const firstOrdered = /mso-list-type\s*:\s*number/i.test(pstyle) ||
            (/mso-list-format/i.test(pstyle) && /%1\.|\[Number\]/i.test(pstyle));
        const group: any[] = [];
        let lj = li;
        while (lj < kids.length) {
            const q: any = kids[lj];
            const qst = (q.getAttribute && q.getAttribute("style")) || "";
            if (!(q.tagName === "P" && /mso-list\s*:/i.test(qst))) break;
            const qOrdered = /mso-list-type\s*:\s*number/i.test(qst) ||
                (/mso-list-format/i.test(qst) && /%1\.|\[Number\]/i.test(qst));
            if (group.length && qOrdered !== firstOrdered) break;
            group.push(q); lj++;
        }
        const listEl = doc.createElement(firstOrdered ? "ol" : "ul");
        for (const q of group) {
            const item = doc.createElement("li");
            Array.from(q.querySelectorAll("span")).forEach((sp: any) => {
                if (/mso-list\s*:\s*Ignore/i.test((sp.getAttribute("style") || ""))) sp.remove();
            });
            while (q.firstChild) item.appendChild(q.firstChild);
            listEl.appendChild(item);
        }
        p.replaceWith(listEl);
        li = lj;
    }
    // 2) MathML → LaTeX（$...$ 行内 / $$...$$ 块级）
    const maths: any[] = Array.from(body.querySelectorAll("math"));
    for (const m of maths) {
        let latex = "";
        try { latex = MathMLToLaTeX.convert((m as any).outerHTML); } catch (e) { latex = ""; }
        if (!latex) { m.replaceWith(doc.createTextNode(" ")); continue; }
        const isBlock = (m as any).hasAttribute("display") ||
            /display\s*:\s*(block|true)/i.test((m as any).getAttribute("style") || "") ||
            !!(m as any).querySelector("mstyle[displaystyle=\"true\"]");
        m.replaceWith(doc.createTextNode(isBlock ? "$$" + latex + "$$" : "$" + latex + "$"));
    }
    return body.innerHTML;
}

const TIMEOUT = 1500;

export const isOnline = () => navigator.onLine === true;

export const getPageTitle = (url) => {
    // No need to request the title when it's not url.
    if (!url.startsWith("http")) {
        return "";
    }

    // No need to request the title when off line.
    if (!isOnline()) {
        return "";
    }

    const req = new XMLHttpRequest();
    let settle;
    const promise = new Promise((resolve, reject) => {
        settle = resolve;
    });
    const handler = () => {
        if (req.readyState === XMLHttpRequest.DONE) {
            if (req.status === 200) {
                const contentType = req.getResponseHeader("Content-Type");
                if (/text\/html/.test(contentType)) {
                    const { response } = req;
                    if (typeof response === "string") {
                        const match = response.match(/<title>(.*)<\/title>/);

                        return match && match[1] ? settle(match[1]) : settle("");
                    }

                    return settle("");
                }

                return settle("");
            } else {
                return settle("");
            }
        }
    };

    const handleError = (e) => {
        settle("");
    };
    req.open("GET", url);
    req.onreadystatechange = handler;
    req.onerror = handleError;
    req.send();

    // Resolve empty string when `TIMEOUT` passed.
    const timer = new Promise((resolve, reject) => {
        setTimeout(() => {
            resolve("");
        }, TIMEOUT);
    });

    return Promise.race([promise, timer]);
};

export const normalizePastedHTML = async function (html) {
    // Only extract the `body.innerHTML` when the `html` is a full HTML Document.
    if (/<body>[\s\S]*<\/body>/.test(html)) {
        const match = /<body>([\s\S]*)<\/body>/.exec(html);
        if (match && typeof match[1] === "string") {
            html = match[1];
        }
    }

    // Fix 10: 粘贴 Word 片段前，先把内联 style 转语义标签、MathML 转 LaTeX
    html = preprocessWordPaste(html);
    // Prevent XSS and sanitize HTML.
    const sanitizedHtml = sanitize(html, PREVIEW_DOMPURIFY_CONFIG);
    const tempWrapper = document.createElement("div");
    tempWrapper.innerHTML = sanitizedHtml;

    // Special process for turndown.js, needed for Number app on macOS.
    const tables = Array.from(tempWrapper.querySelectorAll("table"));

    for (const table of tables) {
        const row = table.querySelector("tr");
        if (row.firstElementChild.tagName !== "TH") {
            [...Array.from(row.children)].forEach((cell) => {
                const th = document.createElement("th");
                th.innerHTML = cell.innerHTML;
                cell.replaceWith(th);
            });
        }
        const paragraphs = Array.from(table.querySelectorAll("p"));

        for (const p of paragraphs) {
            const span = document.createElement("span");
            span.innerHTML = p.innerHTML;
            p.replaceWith(span);
        }

        const tds = Array.from(table.querySelectorAll("td"));

        for (const td of tds) {
            const rawHtml = td.innerHTML;
            if (/<br>/.test(rawHtml)) {
                td.innerHTML = rawHtml.replace(/<br>/g, "&lt;br&gt;");
            }
        }
    }

    // Prevent it parse into a link if copy a url.
    const links: Array<HTMLElement> = Array.from(tempWrapper.querySelectorAll("a"));

    for (const link of links) {
        const href = link.getAttribute("href");
        const text = link.textContent;

        if (href === text) {
            /*
          const title = await getPageTitle(href);
          if (title) {
            link.textContent = title as string;
          } else {
            const span = document.createElement("span");
            span.innerHTML = text;
            link.replaceWith(span);
          }
          */
            const span = document.createElement("span");
            span.innerHTML = text;
            link.replaceWith(span);
        }
    }

    return tempWrapper.innerHTML;
};

/**
 *
 * @param {string} html
 * @param {string} text
 * @param {string} pasteType normal or pasteAsPlainText
 * return html | text | code, if the return value is html, we'll use html as paste data, we'll use text
 * as paste data if the return value is text, we'll create a html code block if the result is code.
 */
export const checkCopyType = function (html, text, pasteType) {
    const getCopyType = (text) => {
        const match =
            /^<([a-zA-Z\d-]+)(?=\s|>).*?>[\s\S]+?<\/([a-zA-Z\d-]+)>$/.exec(
                text.trim()
            );
        if (match && match[1]) {
            const tag = match[1];

            return PARAGRAPH_TYPES.find((type) => type === tag) ? "code" : "text";
        }

        return "text";
    };

    if (pasteType === "normal") {
        return html && text ? "html" : getCopyType(text);
    } else {
        return getCopyType(text);
    }
};
