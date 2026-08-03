/*!
 * meditable v0.2.1
 * Github: https://github.com/geekeditor/meditable
 * (c) 2023-2026 montisan <imontisan@gmail.com>
 * Released under the MIT License.
 */
'use strict';

var module$1 = require('../module.js');
var stateToMarkdown = require('../state/stateToMarkdown.js');
var stateToHtml = require('../state/stateToHtml.js');
var utils$1 = require('../../utils/utils.js');
var url = require('../../utils/url.js');
var paste = require('../../utils/paste.js');
var mathmlToLatex = require('mathml-to-latex');
var htmlToMarkdown = require('../state/htmlToMarkdown.js');
var markdownToState = require('../state/markdownToState.js');
var stateToPlainText = require('../state/stateToPlainText.js');
var image = require('../content/utils/image.js');
var convert = require('../content/utils/convert.js');
var utils = require('./utils.js');

class MEClipboard extends module$1 {
    copyType = "normal";
    // Fix 12: pasteType 默认值补 "normal"，让 checkCopyType 在「既有 html 又有 text」时正确返回 "html" 分支
    pasteType = "normal";
    copyText = "";
    copyHtml = "";
    async prepare() {
        this.bindEvents();
        return true;
    }
    bindEvents() {
        const { event, editable } = this.instance.context;
        const { selection } = editable;
        const copyCutHandler = async (type, event) => {
            event.preventDefault();
            const isCut = event.type === "cut";
            await this.copyHandler(event);
            this.copyType = "normal";
            if (isCut) {
                this.cutHandler();
            }
        };
        const keydownHandler = (type, event) => {
            const { key, metaKey, ctrlKey } = event;
            const { isSameBlock } = selection.cursor;
            if (isSameBlock) {
                return;
            }
            // TODO: Is there any way to identify these key bellow?
            if (/Alt|Option|Control|Meta|Shift|CapsLock|ArrowUp|ArrowDown|ArrowLeft|ArrowRight/.test(key)) {
                return;
            }
            if (metaKey || ctrlKey) {
                return;
            }
            if (key === "Backspace" || key === "Delete") {
                event.preventDefault();
            }
            this.cutHandler();
        };
        event.on("copy", copyCutHandler);
        event.on("cut", copyCutHandler);
        event.on("paste", this.pasteHandler.bind(this));
        event.on("keydown", keydownHandler);
    }
    getSelectionState() {
        const { editable } = this.instance.context;
        const { selection } = editable;
        const { isSameBlock, anchor, anchorBlock, focus, focusBlock, direction } = selection.cursor;
        if (!anchorBlock) {
            return null;
        }
        // Handle copy/cut in one block.
        if (isSameBlock) {
            const begin = Math.min(anchor.offset, focus.offset);
            const end = Math.max(anchor.offset, focus.offset);
            const text = anchorBlock.renderer.text.substring(begin, end);
            const state = [];
            if (anchorBlock.type === 'code') {
                state.push({
                    ...anchorBlock.renderer.anchor.data,
                    text
                });
            }
            else {
                state.push({
                    ...anchorBlock.data,
                    text
                });
            }
            return { state, text };
        }
        const startBlock = direction === "forward" ? anchorBlock : focusBlock;
        const endBlock = direction === "forward" ? focusBlock : anchorBlock;
        const startOffset = direction === "forward" ? anchor.offset : focus.offset;
        const endOffset = direction === "forward" ? focus.offset : anchor.offset;
        const copyState = utils.copyBlocks(startBlock, startOffset, endBlock, endOffset);
        return { state: copyState };
    }
    async getClipboardData() {
        let text = "";
        let html = "";
        const mdGenerator = new stateToMarkdown();
        const htmlGenerator = new stateToHtml({ diagramHtmlType: this.instance.options.diagramHtmlType, staticNodeHtmlRenderer: this.instance.options.staticNodeHtmlRenderer, staticBlockHtmlRenderer: this.instance.options.staticBlockHtmlRenderer });
        const copyState = this.getSelectionState();
        if (!copyState) {
            return { html, text };
        }
        text = copyState.text || mdGenerator.generate(copyState.state);
        html = await htmlGenerator.generate(copyState.state);
        return { html, text };
    }
    // Fix 4: Firefox 下 copy/cut 事件对象的 clipboardData 在 await 后会被冻结
    // （"Modifications are not allowed for this document"）。故先同步算出待写内容，
    // 优先写 event.clipboardData，失败则回退 navigator.clipboard.write。
    async copyHandler(event) {
        const { copyType } = this;
        let html = "";
        let text = "";
        switch (copyType) {
            case "normal": {
                const data = await this.getClipboardData();
                html = data.html;
                text = data.text;
                break;
            }
            case "copyHtml": {
                html = this.copyHtml;
                text = this.copyHtml;
                break;
            }
            case "copyPlainText": {
                html = "";
                text = this.copyText;
                break;
            }
        }
        try {
            if (event && event.clipboardData && typeof event.clipboardData.setData === "function") {
                event.clipboardData.setData("text/html", html);
                event.clipboardData.setData("text/plain", text);
            }
            else {
                throw new Error("no-event-clipboardData");
            }
        }
        catch (err) {
            try {
                if (typeof navigator !== "undefined" && navigator.clipboard && typeof ClipboardItem !== "undefined") {
                    const item = new ClipboardItem({
                        "text/html": new Blob([html], { type: "text/html" }),
                        "text/plain": new Blob([text], { type: "text/plain" }),
                    });
                    await navigator.clipboard.write([item]);
                }
            }
            catch (e) {
                /* 剪贴板 API 不可用时静默忽略；cut 的删除文本逻辑不依赖此处写入 */
            }
        }
    }
    cutHandler() {
        const { editable, content, event } = this.instance.context;
        const { selection } = editable;
        const { isSameBlock, anchor, anchorBlock, focus, focusBlock, direction, } = selection.cursor;
        if (!anchorBlock) {
            return;
        }
        // Handler `cut` event in the same block.
        if (isSameBlock) {
            const { text: oldText } = anchorBlock.renderer;
            const startOffset = direction === "forward" ? anchor.offset : focus.offset;
            const endOffset = direction === "forward" ? focus.offset : anchor.offset;
            const text = oldText.substring(0, startOffset) + oldText.substring(endOffset);
            anchorBlock.renderer.render({ text, cursor: { anchorBlock, focusBlock, anchor: { offset: startOffset }, focus: { offset: startOffset } } });
            return anchorBlock.renderer.setCursor({ focus: { offset: startOffset } });
        }
        const startBlock = direction === "forward" ? anchorBlock : focusBlock;
        const endBlock = direction === "forward" ? focusBlock : anchorBlock;
        const startOffset = direction === "forward" ? anchor.offset : focus.offset;
        const endOffset = direction === "forward" ? focus.offset : anchor.offset;
        event.trigger("savescence");
        utils.cutBlocks(startBlock, startOffset, endBlock, endOffset);
        if (content.children.length === 0) {
            const newParagraphBlock = content.insertAtEnd();
            newParagraphBlock.renderer.setCursor();
        }
        event.trigger("savescence");
    }
    async pasteHandler(type, event) {
        event.preventDefault();
        event.stopPropagation();
        const { editable, content } = this.instance.context;
        const { selection } = editable;
        const { isSameBlock, anchorBlock } = selection.cursor;
        if (!isSameBlock) {
            this.cutHandler();
            return this.pasteHandler(type, event);
        }
        if (!anchorBlock) {
            return;
        }
        return this.processDataTransfer(anchorBlock, event.clipboardData);
    }
    // Fix 13: Word 粘贴公式（OMML → LaTeX）。转换链路 OMML → MathML → LaTeX。
    async getOmmlXsl() {
        if (this.__ommlXsl)
            return this.__ommlXsl;
        if (this.__ommlXslPromise)
            return this.__ommlXslPromise;
        this.__ommlXslPromise = fetch("/OMML2MML.xsl")
            .then((r) => r.text())
            .then((t) => {
            const d = new DOMParser().parseFromString(t, "application/xml");
            this.__ommlXsl = d;
            return d;
        });
        return this.__ommlXslPromise;
    }
    // Fix 13: 把一段 Word 条件注释里的 OMML 转成 LaTeX。返回 {latex, block} 或 null。
    ommlCommentToLatex(data, xslDoc) {
        const m = data.match(/<m:oMathPara>[\s\S]*<\/m:oMathPara>|<m:oMath>[\s\S]*<\/m:oMath>/);
        if (!m)
            return null;
        const block = m[0].indexOf("<m:oMathPara>") === 0;
        // 坑 a：剥掉 Word 混进 OMML 的排版标签（<span lang=EN-US …> 属性无引号，XML 解析必失败）
        let omml = m[0].replace(/<\/?(?!m:)[a-zA-Z][^>]*>/g, "");
        // 坑 b：Word 省略 <m:t> 直接写 <m:r>F</m:r>，而 XSL 匹配 m:r/m:t，不补则转出空 MathML
        omml = omml.replace(/<m:r>([^<]+)<\/m:r>/g, "<m:r><m:t>$1</m:t></m:r>");
        omml = omml.replace(/^<m:(oMathPara|oMath)>/, '<m:$1 xmlns:m="http://schemas.openxmlformats.org/officeDocument/2006/math">');
        try {
            const xdoc = new DOMParser().parseFromString(omml, "text/xml");
            if (xdoc.getElementsByTagName("parsererror").length)
                return null;
            const processor = new XSLTProcessor();
            processor.importStylesheet(xslDoc);
            const mmlDoc = processor.transformToDocument(xdoc);
            if (!mmlDoc || !mmlDoc.documentElement)
                return null;
            let mmlStr = new XMLSerializer().serializeToString(mmlDoc.documentElement);
            mmlStr = mmlStr.replace(/xmlns:mml/g, "xmlns").replace(/mml:/g, "");
            const latex = mathmlToLatex.MathMLToLaTeX.convert(mmlStr);
            if (!latex || !latex.trim())
                return null;
            return { latex: latex.trim(), block };
        }
        catch (e) {
            return null;
        }
    }
    // Fix 13: Word 粘贴公式（OMML 在 text/html 的 msEquation 条件注释里）转 LaTeX。
    async convertWordEquations(html) {
        if (!html || typeof html !== "string")
            return html;
        if (html.indexOf("msEquation") === -1)
            return html;
        let doc;
        try {
            doc = new DOMParser().parseFromString("<body>" + html + "</body>", "text/html");
        }
        catch (e) {
            return html;
        }
        const body = doc.body || doc.documentElement;
        if (!body)
            return html;
        const walker = doc.createTreeWalker(body, NodeFilter.SHOW_COMMENT);
        const eqComments = [];
        let node;
        while ((node = walker.nextNode())) {
            if (/^\[if gte msEquation/.test(node.data))
                eqComments.push(node);
        }
        if (!eqComments.length)
            return html;
        let xslDoc;
        try {
            xslDoc = await this.getOmmlXsl();
        }
        catch (e) {
            return html;
        }
        if (!xslDoc)
            return html;
        for (const cmt of eqComments) {
            const res = this.ommlCommentToLatex(cmt.data, xslDoc);
            // 转换失败就原样留着兜底图，至少不丢内容
            if (!res)
                continue;
            const tex = res.block ? "$$" + res.latex + "$$" : "$" + res.latex + "$";
            const texNode = doc.createTextNode(tex);
            cmt.replaceWith(texNode);
            // 删掉紧随的 <![if !msEquation]>…<![endif]> 兜底块（含那张 PNG）。
            let s = texNode.nextSibling;
            while (s && s.nodeType === 3 && !s.nodeValue.trim())
                s = s.nextSibling;
            if (!s || s.nodeType !== 8 || !/^\[if !msEquation\]/.test(s.data))
                continue;
            const doomed = [];
            let depth = 0;
            for (let cur = s; cur; cur = cur.nextSibling) {
                if (cur.nodeType === 8) {
                    if (/^\[if /.test(cur.data))
                        depth++;
                    else if (/^\[endif\]/.test(cur.data))
                        depth--;
                }
                doomed.push(cur);
                if (depth === 0)
                    break;
            }
            for (const d of doomed) {
                if (d.parentNode)
                    d.parentNode.removeChild(d);
            }
        }
        return body.innerHTML;
    }
    // Fix 11: 粘贴的内联 data:image 图片上传到 imageUpload，src 替换为可访问 URL
    async uploadInlineImages(html) {
        const imageUpload = this.instance.options.imageUpload;
        if (!imageUpload || !html || typeof html !== "string")
            return html;
        let doc;
        try {
            doc = new DOMParser().parseFromString("<body>" + html + "</body>", "text/html");
        }
        catch (e) {
            return html;
        }
        const body = doc.body || doc.documentElement;
        if (!body)
            return html;
        const imgs = Array.from(body.querySelectorAll("img[src^=\"data:image\"]"));
        if (!imgs.length)
            return html;
        const uploads = imgs.map(async (img) => {
            try {
                const src = img.getAttribute("src") || "";
                const mm = /^data:([^;]+);base64,(.*)$/.exec(src);
                if (!mm)
                    return;
                const mime = mm[1] || "image/png";
                const bin = atob(mm[2]);
                const arr = new Uint8Array(bin.length);
                for (let i = 0; i < bin.length; i++)
                    arr[i] = bin.charCodeAt(i);
                const blob = new Blob([arr], { type: mime });
                const ext = (mime.indexOf("/") >= 0 ? mime.split("/")[1] : "") || "png";
                const file = new File([blob], "pasted-image." + ext, { type: mime });
                const url = await imageUpload(file);
                if (url)
                    img.setAttribute("src", url);
            }
            catch (e) {
                // 上传失败则保留原 data: URI
            }
        });
        await Promise.all(uploads);
        return body.innerHTML;
    }
    // Fix 15: 粘贴/拖入的图片文件（截图、拖拽）也要上传，不走 blob: 临时地址。
    async processFiles(files) {
        const imageUpload = this.instance.options.imageUpload;
        const items = await Promise.all(Array.from(files).map(async (file) => {
            const [fileType] = file.type.split("/");
            if (fileType !== "image")
                return "";
            let src = "";
            if (imageUpload) {
                try {
                    const url = await imageUpload(file);
                    if (url)
                        src = url;
                }
                catch (e) { /* 上传失败回退 blob: */ }
            }
            if (!src)
                src = image.imageUtils.createObjectURL(file);
            const name = file.name || "";
            return "![" + name + "](" + src + ")";
        }));
        return items.filter((v) => !!v).join("\n\n");
    }
    async processDataTransfer(anchorBlock, dataTransfer, isDragDrop = false) {
        const { bulletListMarker, footnote, isGitlabCompatibilityEnabled, superSubScript, trimUnnecessaryCodeBlockEmptyLines, frontMatter, } = this.instance.options;
        let text = dataTransfer.getData("text/plain");
        let html = dataTransfer.getData("text/html");
        const types = dataTransfer.types;
        const includesFiles = types.includes ? types.includes('Files') : types.contains('Files');
        if (includesFiles) {
            // Fix 15: 图片文件同样调用 imageUpload 上传，失败时回退 blob:
            text = await this.processFiles(dataTransfer.files);
        }
        // Support pasted URLs from Firefox.
        if (url.URL_REG.test(text) && !/\s/.test(text) && !html) {
            html = `<a href="${text}">${text}</a>`;
        }
        // Fix 13: Word 公式(OMML)转 LaTeX。必须排在 uploadInlineImages 之前——公式的兜底
        // 图同样是 data:image，若先上传就变成 http URL，公式块便被拆散、再也认不出来。
        html = await this.convertWordEquations(html);
        // Fix 11: 剩下的内联 data:image 才是真实图片，上传换成可访问 URL。
        // 必须排在 sanitize 之前，否则 data: 会被 DOMPurify 剥离。
        html = await this.uploadInlineImages(html);
        // Remove crap from HTML such as meta data and styles.
        html = await paste.normalizePastedHTML(html);
        // Process by pasteTransform
        if (this.instance.options.pasteTransform) {
            const transformContent = this.instance.options.pasteTransform({ html, text });
            if (transformContent) {
                html = transformContent.html;
                text = transformContent.text;
            }
        }
        const copyType = paste.checkCopyType(html, text, this.pasteType);
        const { start, end } = anchorBlock.renderer.getCursor();
        const { text: blockText } = anchorBlock.renderer;
        let wrapperBlock = anchorBlock.renderer.anchor;
        const originWrapperBlock = wrapperBlock;
        if (/html|text/.test(copyType)) {
            let markdown = copyType === "html" && anchorBlock.type !== "code"
                // Fix 14: 传入 keeps=['u']，保留 <u> 下划线（默认 turndown 会剥掉未注册内联标签）
                ? new htmlToMarkdown({ bulletListMarker }).generate(html, ['u'])
                : text;
            if (anchorBlock.type !== "code" &&
                (/\n\n/.test(markdown) ||
                    isDragDrop ||
                    convert.INLINE_UPDATE_REG.test(markdown) ||
                    convert.CODE_BLOCK_REG.test(markdown) ||
                    convert.MATH_BLOCK_REG.test(markdown) ||
                    convert.TABLE_BLOCK_REG.test(markdown) ||
                    convert.HTML_BLOCK_REG.test(markdown))) {
                if (start.offset !== end.offset) {
                    const newText = blockText.substring(0, start.offset) + blockText.substring(end.offset);
                    anchorBlock.renderer.render({ text: newText });
                }
                // Has multiple paragraphs.
                const states = new markdownToState({
                    footnote,
                    isGitlabCompatibilityEnabled,
                    superSubScript,
                    trimUnnecessaryCodeBlockEmptyLines,
                    frontMatter,
                }).generate(markdown).children;
                for (const state of states) {
                    wrapperBlock = wrapperBlock.insertAdjacent("afterend", { data: state });
                }
                // Remove empty paragraph when paste.
                if (originWrapperBlock.type === 'paragraph' && originWrapperBlock.data.text === "") {
                    originWrapperBlock.remove();
                }
                const cursorBlock = wrapperBlock.firstContentInDescendant();
                const offset = cursorBlock.renderer.text.length;
                cursorBlock.renderer.setCursor({ focus: { offset }, scrollToView: true });
            }
            else {
                if (anchorBlock.type === "language") {
                    markdown = markdown.replace(/\n/g, "");
                }
                else if (anchorBlock.type === "table-td" || anchorBlock.type === "table-th") {
                    markdown = markdown.replace(/\n/g, "<br/>");
                }
                const newText = blockText.substring(0, start.offset) +
                    markdown +
                    blockText.substring(end.offset);
                let offset = start.offset + markdown.length;
                // Convert if needed
                if (anchorBlock.type === "paragraph" && convert.convertIfNeeded.call(anchorBlock.renderer, newText, offset)) {
                    return;
                }
                anchorBlock.renderer.render({ text: newText, cursor: { anchorBlock, focusBlock: anchorBlock, anchor: { offset }, focus: { offset } } });
                offset = Math.min(offset, anchorBlock.renderer.text.length);
                anchorBlock.renderer.setCursor({ focus: { offset } });
                // Update html preview if the out container is `html-block`
                if (/html-block|math-block|diagram-block/.test(originWrapperBlock.type)) {
                    originWrapperBlock.renderer.forceUpdate();
                }
            }
        }
        else {
            const codeData = {
                id: utils$1.generateId(),
                type: "code-block",
                meta: {
                    type: "fenced",
                    lang: "html",
                },
                children: [
                    {
                        id: utils$1.generateId(),
                        type: 'language',
                        text: 'html'
                    },
                    {
                        id: utils$1.generateId(),
                        type: 'code',
                        meta: {
                            lang: 'html',
                        },
                        text: text
                    }
                ]
            };
            const offset = text.length;
            const codeBlock = originWrapperBlock.insertAdjacent("afterend", { data: codeData });
            const cursorBlock = codeBlock?.lastContentInDescendant();
            cursorBlock?.renderer.setCursor({ focus: { offset: Math.min(offset, cursorBlock.renderer.text.length) }, scrollToView: true });
        }
    }
    copyAsMarkdown() {
        let text = "";
        const mdGenerator = new stateToMarkdown();
        const copyState = this.getSelectionState();
        if (copyState) {
            text = copyState.text || mdGenerator.generate(copyState.state);
        }
        this.copyPlainText(text);
    }
    copyAsHtml() {
        const copyState = this.getSelectionState();
        if (copyState) {
            const htmlGenerator = new stateToHtml({ diagramHtmlType: this.instance.options.diagramHtmlType, staticNodeHtmlRenderer: this.instance.options.staticNodeHtmlRenderer, staticBlockHtmlRenderer: this.instance.options.staticBlockHtmlRenderer });
            htmlGenerator.generate(copyState.state).then((html) => {
                this.copy("copyHtml", "", html);
            });
        }
    }
    async copyAsPlainText() {
        let text = "";
        const copyState = this.getSelectionState();
        if (copyState) {
            const plainTextGenerator = new stateToPlainText();
            text = plainTextGenerator.generate(copyState.state);
        }
        this.copyPlainText(text);
    }
    pasteAsPlainText() {
        this.pasteType = "pasteAsPlainText";
        document.execCommand("paste");
        this.pasteType = "normal";
    }
    copyPlainText(text) {
        this.copy("copyPlainText", text);
    }
    copy(type, text = "", html = "") {
        this.copyText = text;
        this.copyHtml = html;
        this.copyType = type;
        document.execCommand("copy");
    }
}

module.exports = MEClipboard;
