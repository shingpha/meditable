import MEModule from "../module";
import StateToMarkdown from "../state/stateToMarkdown";
import StateToHtml from "../state/stateToHtml";
import { generateId } from "@/packages/utils/utils";
import { MEBlockData, MEBlockInstance } from "@/packages/types";
import { URL_REG } from "@/packages/utils/url";
import { checkCopyType, normalizePastedHTML } from "@/packages/utils/paste";
// Fix 13: Word 粘贴公式（OMML → LaTeX）依赖 mathml-to-latex
import { MathMLToLaTeX } from "mathml-to-latex";
import HtmlToMarkdown from "../state/htmlToMarkdown";
import MarkdownToState from "../state/markdownToState";
import StateToPlainText from "../state/stateToPlainText";
import { imageUtils } from "../content/utils/image";
import { CODE_BLOCK_REG, HTML_BLOCK_REG, INLINE_UPDATE_REG, MATH_BLOCK_REG, TABLE_BLOCK_REG, convertIfNeeded } from "../content/utils/convert";
import { cutBlocks, copyBlocks } from "./utils";


class MEClipboard extends MEModule {

    private copyType: string = "normal";
    // Fix 12: pasteType 默认值补 "normal"，让 checkCopyType 在「既有 html 又有 text」时正确返回 "html" 分支
    private pasteType: string = "normal";
    private copyText: string = "";
    private copyHtml: string = "";

    async prepare(): Promise<boolean> {

        this.bindEvents()
        return true
    }

    private bindEvents() {
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

    private getSelectionState() {
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
                })

            } else {
                state.push({
                    ...anchorBlock.data,
                    text
                })
            }

            return { state, text };

        }

        const startBlock = direction === "forward" ? anchorBlock : focusBlock;
        const endBlock = direction === "forward" ? focusBlock : anchorBlock;
        const startOffset = direction === "forward" ? anchor.offset : focus.offset;
        const endOffset = direction === "forward" ? focus.offset : anchor.offset;
        const copyState = copyBlocks(startBlock, startOffset, endBlock, endOffset);

        return { state: copyState };
    }

    private async getClipboardData() {

        let text = "";
        let html = "";

        const mdGenerator = new StateToMarkdown();
        const htmlGenerator = new StateToHtml({ diagramHtmlType: this.instance.options.diagramHtmlType, staticNodeHtmlRenderer: this.instance.options.staticNodeHtmlRenderer, staticBlockHtmlRenderer: this.instance.options.staticBlockHtmlRenderer });
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
    private async copyHandler(event: any) {
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
            } else {
                throw new Error("no-event-clipboardData");
            }
        } catch (err) {
            try {
                if (typeof navigator !== "undefined" && navigator.clipboard && typeof ClipboardItem !== "undefined") {
                    const item = new ClipboardItem({
                        "text/html": new Blob([html], { type: "text/html" }),
                        "text/plain": new Blob([text], { type: "text/plain" }),
                    });
                    await navigator.clipboard.write([item]);
                }
            } catch (e) {
                /* 剪贴板 API 不可用时静默忽略；cut 的删除文本逻辑不依赖此处写入 */
            }
        }
    }

    private cutHandler() {
        const { editable, content, event } = this.instance.context;
        const { selection } = editable;

        const {
            isSameBlock,
            anchor,
            anchorBlock,
            focus,
            focusBlock,
            direction,
        } = selection.cursor;

        if (!anchorBlock) {
            return;
        }

        // Handler `cut` event in the same block.
        if (isSameBlock) {
            const { text: oldText } = anchorBlock.renderer;
            const startOffset =
                direction === "forward" ? anchor.offset : focus.offset;
            const endOffset = direction === "forward" ? focus.offset : anchor.offset;

            const text =
                oldText.substring(0, startOffset) + oldText.substring(endOffset);
            anchorBlock.renderer.render({ text, cursor: { anchorBlock, focusBlock, anchor: { offset: startOffset }, focus: { offset: startOffset } } })

            return anchorBlock.renderer.setCursor({ focus: { offset: startOffset } });
        }

        const startBlock = direction === "forward" ? anchorBlock : focusBlock;
        const endBlock = direction === "forward" ? focusBlock : anchorBlock;
        const startOffset = direction === "forward" ? anchor.offset : focus.offset;
        const endOffset = direction === "forward" ? focus.offset : anchor.offset;

        event.trigger("savescence")
        cutBlocks(startBlock, startOffset, endBlock, endOffset);

        if (content.children.length === 0) {
            const newParagraphBlock = content.insertAtEnd();
            newParagraphBlock.renderer.setCursor();
        }
        event.trigger("savescence")
    }

    private async pasteHandler(type, event) {
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

        return this.processDataTransfer(anchorBlock, event.clipboardData)
    }

    // Fix 13: Word 粘贴公式（OMML → LaTeX）。转换链路 OMML → MathML → LaTeX。
    async getOmmlXsl(): Promise<Document> {
        if ((this as any).__ommlXsl) return (this as any).__ommlXsl;
        if ((this as any).__ommlXslPromise) return (this as any).__ommlXslPromise;
        (this as any).__ommlXslPromise = fetch("/OMML2MML.xsl")
            .then((r) => r.text())
            .then((t) => {
                const d = new DOMParser().parseFromString(t, "application/xml");
                (this as any).__ommlXsl = d;
                return d;
            });
        return (this as any).__ommlXslPromise;
    }

    // Fix 13: 把一段 Word 条件注释里的 OMML 转成 LaTeX。返回 {latex, block} 或 null。
    ommlCommentToLatex(data: string, xslDoc: Document): { latex: string; block: boolean } | null {
        const m = data.match(/<m:oMathPara>[\s\S]*<\/m:oMathPara>|<m:oMath>[\s\S]*<\/m:oMath>/);
        if (!m) return null;
        const block = m[0].indexOf("<m:oMathPara>") === 0;
        // 坑 a：剥掉 Word 混进 OMML 的排版标签（<span lang=EN-US …> 属性无引号，XML 解析必失败）
        let omml = m[0].replace(/<\/?(?!m:)[a-zA-Z][^>]*>/g, "");
        // 坑 b：Word 省略 <m:t> 直接写 <m:r>F</m:r>，而 XSL 匹配 m:r/m:t，不补则转出空 MathML
        omml = omml.replace(/<m:r>([^<]+)<\/m:r>/g, "<m:r><m:t>$1</m:t></m:r>");
        omml = omml.replace(/^<m:(oMathPara|oMath)>/, '<m:$1 xmlns:m="http://schemas.openxmlformats.org/officeDocument/2006/math">');
        try {
            const xdoc = new DOMParser().parseFromString(omml, "text/xml");
            if (xdoc.getElementsByTagName("parsererror").length) return null;
            const processor = new XSLTProcessor();
            processor.importStylesheet(xslDoc);
            const mmlDoc = processor.transformToDocument(xdoc);
            if (!mmlDoc || !mmlDoc.documentElement) return null;
            let mmlStr = new XMLSerializer().serializeToString(mmlDoc.documentElement);
            mmlStr = mmlStr.replace(/xmlns:mml/g, "xmlns").replace(/mml:/g, "");
            const latex = MathMLToLaTeX.convert(mmlStr);
            if (!latex || !latex.trim()) return null;
            return { latex: latex.trim(), block };
        } catch (e) {
            return null;
        }
    }

    // Fix 13: Word 粘贴公式（OMML 在 text/html 的 msEquation 条件注释里）转 LaTeX。
    async convertWordEquations(html: string): Promise<string> {
        if (!html || typeof html !== "string") return html;
        if (html.indexOf("msEquation") === -1) return html;
        let doc: Document;
        try {
            doc = new DOMParser().parseFromString("<body>" + html + "</body>", "text/html");
        } catch (e) {
            return html;
        }
        const body = doc.body || (doc.documentElement as any);
        if (!body) return html;
        const walker = doc.createTreeWalker(body, NodeFilter.SHOW_COMMENT);
        const eqComments: Comment[] = [];
        let node: any;
        while ((node = walker.nextNode())) {
            if (/^\[if gte msEquation/.test(node.data)) eqComments.push(node as Comment);
        }
        if (!eqComments.length) return html;
        let xslDoc: Document;
        try {
            xslDoc = await this.getOmmlXsl();
        } catch (e) {
            return html;
        }
        if (!xslDoc) return html;
        for (const cmt of eqComments) {
            const res = this.ommlCommentToLatex(cmt.data, xslDoc);
            // 转换失败就原样留着兜底图，至少不丢内容
            if (!res) continue;
            const tex = res.block ? "$$" + res.latex + "$$" : "$" + res.latex + "$";
            const texNode = doc.createTextNode(tex);
            cmt.replaceWith(texNode);
            // 删掉紧随的 <![if !msEquation]>…<![endif]> 兜底块（含那张 PNG）。
            let s: any = texNode.nextSibling;
            while (s && s.nodeType === 3 && !s.nodeValue.trim()) s = s.nextSibling;
            if (!s || s.nodeType !== 8 || !/^\[if !msEquation\]/.test(s.data)) continue;
            const doomed: Node[] = [];
            let depth = 0;
            for (let cur: any = s; cur; cur = cur.nextSibling) {
                if (cur.nodeType === 8) {
                    if (/^\[if /.test(cur.data)) depth++;
                    else if (/^\[endif\]/.test(cur.data)) depth--;
                }
                doomed.push(cur);
                if (depth === 0) break;
            }
            for (const d of doomed) {
                if (d.parentNode) d.parentNode.removeChild(d);
            }
        }
        return body.innerHTML;
    }

    // Fix 11: 粘贴的内联 data:image 图片上传到 imageUpload，src 替换为可访问 URL
    async uploadInlineImages(html: string): Promise<string> {
        const imageUpload = this.instance.options.imageUpload;
        if (!imageUpload || !html || typeof html !== "string") return html;
        let doc: Document;
        try {
            doc = new DOMParser().parseFromString("<body>" + html + "</body>", "text/html");
        } catch (e) {
            return html;
        }
        const body = doc.body || (doc.documentElement as any);
        if (!body) return html;
        const imgs = Array.from(body.querySelectorAll("img[src^=\"data:image\"]")) as any[];
        if (!imgs.length) return html;
        const uploads = imgs.map(async (img: any) => {
            try {
                const src = img.getAttribute("src") || "";
                const mm = /^data:([^;]+);base64,(.*)$/.exec(src);
                if (!mm) return;
                const mime = mm[1] || "image/png";
                const bin = atob(mm[2]);
                const arr = new Uint8Array(bin.length);
                for (let i = 0; i < bin.length; i++) arr[i] = bin.charCodeAt(i);
                const blob = new Blob([arr], { type: mime });
                const ext = (mime.indexOf("/") >= 0 ? mime.split("/")[1] : "") || "png";
                const file = new File([blob], "pasted-image." + ext, { type: mime });
                const url = await imageUpload(file);
                if (url) img.setAttribute("src", url);
            } catch (e) {
                // 上传失败则保留原 data: URI
            }
        });
        await Promise.all(uploads);
        return body.innerHTML;
    }

    // Fix 15: 粘贴/拖入的图片文件（截图、拖拽）也要上传，不走 blob: 临时地址。
    async processFiles(files: FileList): Promise<string> {
        const imageUpload = this.instance.options.imageUpload;
        const items = await Promise.all(Array.from(files).map(async (file) => {
            const [fileType] = file.type.split("/");
            if (fileType !== "image") return "";
            let src = "";
            if (imageUpload) {
                try {
                    const url = await imageUpload(file);
                    if (url) src = url;
                } catch (e) { /* 上传失败回退 blob: */ }
            }
            if (!src) src = imageUtils.createObjectURL(file);
            const name = file.name || "";
            return "![" + name + "](" + src + ")";
        }));
        return items.filter((v) => !!v).join("\n\n");
    }
    public async processDataTransfer(anchorBlock: MEBlockInstance, dataTransfer: DataTransfer, isDragDrop = false): Promise<void> {

        const {
            bulletListMarker,
            footnote,
            isGitlabCompatibilityEnabled,
            superSubScript,
            trimUnnecessaryCodeBlockEmptyLines,
            frontMatter,
        } = this.instance.options;

        let text = dataTransfer.getData("text/plain");
        let html = dataTransfer.getData("text/html");
        const types = dataTransfer.types;
        const includesFiles = types.includes ? types.includes('Files') : (types as any).contains('Files');
        if (includesFiles) {
            // Fix 15: 图片文件同样调用 imageUpload 上传，失败时回退 blob:
            text = await this.processFiles(dataTransfer.files);
        }

        // Support pasted URLs from Firefox.
        if (URL_REG.test(text) && !/\s/.test(text) && !html) {
            html = `<a href="${text}">${text}</a>`;
        }

        // Fix 13: Word 公式(OMML)转 LaTeX。必须排在 uploadInlineImages 之前——公式的兜底
        // 图同样是 data:image，若先上传就变成 http URL，公式块便被拆散、再也认不出来。
        html = await this.convertWordEquations(html);
        // Fix 11: 剩下的内联 data:image 才是真实图片，上传换成可访问 URL。
        // 必须排在 sanitize 之前，否则 data: 会被 DOMPurify 剥离。
        html = await this.uploadInlineImages(html);
        // Remove crap from HTML such as meta data and styles.
        html = await normalizePastedHTML(html);

        // Process by pasteTransform
        if (this.instance.options.pasteTransform) {
            const transformContent = this.instance.options.pasteTransform({ html, text });
            if (transformContent) {
                html = transformContent.html;
                text = transformContent.text;
            }
        }

        const copyType = checkCopyType(html, text, this.pasteType);

        const { start, end } = anchorBlock.renderer.getCursor();
        const { text: blockText } = anchorBlock.renderer;
        let wrapperBlock = anchorBlock.renderer.anchor;
        const originWrapperBlock = wrapperBlock;

        if (/html|text/.test(copyType)) {
            let markdown =
                copyType === "html" && anchorBlock.type !== "code"
                    // Fix 14: 传入 keeps=['u']，保留 <u> 下划线（默认 turndown 会剥掉未注册内联标签）
                    ? new HtmlToMarkdown({ bulletListMarker }).generate(html, ['u'])
                    : text;


            if (anchorBlock.type !== "code" &&
                (/\n\n/.test(markdown) ||
                    isDragDrop ||
                    INLINE_UPDATE_REG.test(markdown) ||
                    CODE_BLOCK_REG.test(markdown) ||
                    MATH_BLOCK_REG.test(markdown) ||
                    TABLE_BLOCK_REG.test(markdown) ||
                    HTML_BLOCK_REG.test(markdown)
                )
            ) {
                if (start.offset !== end.offset) {
                    const newText =
                        blockText.substring(0, start.offset) + blockText.substring(end.offset);
                    anchorBlock.renderer.render({ text: newText });
                }
                // Has multiple paragraphs.
                const states = new MarkdownToState({
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
                cursorBlock.renderer.setCursor({ focus: { offset } , scrollToView: true});
            } else {
                if (anchorBlock.type === "language") {
                    markdown = markdown.replace(/\n/g, "");
                } else if (anchorBlock.type === "table-td" || anchorBlock.type === "table-th") {
                    markdown = markdown.replace(/\n/g, "<br/>");
                }

                const newText =
                    blockText.substring(0, start.offset) +
                    markdown +
                    blockText.substring(end.offset);
                let offset = start.offset + markdown.length;
                // Convert if needed
                if (anchorBlock.type === "paragraph" && convertIfNeeded.call(anchorBlock.renderer, newText, offset)) {
                    return
                }

                anchorBlock.renderer.render({ text: newText, cursor: { anchorBlock, focusBlock: anchorBlock, anchor: { offset }, focus: { offset } } })
                offset = Math.min(offset, anchorBlock.renderer.text.length)
                anchorBlock.renderer.setCursor({ focus: { offset } });
                // Update html preview if the out container is `html-block`
                if (
                    /html-block|math-block|diagram-block/.test(
                        originWrapperBlock.type
                    )
                ) {
                    originWrapperBlock.renderer.forceUpdate();
                }
            }
        } else {
            const codeData: MEBlockData = {
                id: generateId(),
                type: "code-block",
                meta: {
                    type: "fenced",
                    lang: "html",
                },
                children: [
                    {
                        id: generateId(),
                        type: 'language',
                        text: 'html'
                    },
                    {
                        id: generateId(),
                        type: 'code',
                        meta: {
                            lang: 'html',
                        },
                        text: text
                    }
                ]
            };
            const offset = text.length;
            const codeBlock = originWrapperBlock.insertAdjacent("afterend", { data: codeData })
            const cursorBlock = codeBlock?.lastContentInDescendant()
            cursorBlock?.renderer.setCursor({ focus: { offset: Math.min(offset, cursorBlock.renderer.text.length) }, scrollToView: true })
        }

    }

    public copyAsMarkdown() {
        let text = "";
        const mdGenerator = new StateToMarkdown();
        const copyState = this.getSelectionState();
        if (copyState) {
            text = copyState.text || mdGenerator.generate(copyState.state);

        }

        this.copyPlainText(text)

    }


    public copyAsHtml() {
        const copyState = this.getSelectionState();
        if (copyState) {
            const htmlGenerator = new StateToHtml({ diagramHtmlType: this.instance.options.diagramHtmlType, staticNodeHtmlRenderer: this.instance.options.staticNodeHtmlRenderer, staticBlockHtmlRenderer: this.instance.options.staticBlockHtmlRenderer });
            htmlGenerator.generate(copyState.state).then((html) => {
                this.copy("copyHtml", "", html);
            });
        }
    }

    public async copyAsPlainText() {
        let text = "";
        const copyState = this.getSelectionState();
        if (copyState) {
            const plainTextGenerator = new StateToPlainText();
            text = plainTextGenerator.generate(copyState.state);
        }

        this.copyPlainText(text);
    }

    public pasteAsPlainText() {
        this.pasteType = "pasteAsPlainText";
        document.execCommand("paste");
        this.pasteType = "normal";
    }

    public copyPlainText(text: string) {
        this.copy("copyPlainText", text)
    }

    public copy(type, text = "", html = "") {
        this.copyText = text;
        this.copyHtml = html;
        this.copyType = type;
        document.execCommand("copy");
    }


}

export default MEClipboard;
