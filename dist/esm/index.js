/*!
 * meditable v0.2.1
 * Github: https://github.com/geekeditor/meditable
 * (c) 2023-2026 montisan <imontisan@gmail.com>
 * Released under the MIT License.
 */
import EventListeners from './utils/listeners.js';
import Modules from './modules/index.js';
export { default as HTMLParser } from './modules/editable/parser.js';
export { default as MarkdownToState } from './modules/state/markdownToState.js';
export { default as StateToMarkdown } from './modules/state/stateToMarkdown.js';
export { default as HtmlToMarkdown } from './modules/state/htmlToMarkdown.js';
export { default as StateToHtml } from './modules/state/stateToHtml.js';
export { default as StateToPlainText } from './modules/state/stateToPlainText.js';
export { tokenizer } from './modules/content/inlineRenderers/tokenizer/index.js';
export { filterOutline, flattenToOutline } from './utils/outline.js';
import MEPlugin from './modules/plugin.js';
export { htmlToMarkdown, markdownToHtml } from './utils/markdownHtml.js';
export { default as MEPluginContextMenu } from './plugins/contextMenu/index.js';
export { default as MEPluginBubbleToolbar } from './plugins/bubbleToolbar/index.js';

const DEFAULT_OPTIONS = {
    // Whether to trim the beginning and ending empty line in code block when open markdown.
    trimUnnecessaryCodeBlockEmptyLines: false,
    preferLooseListItem: true,
    autoPairBracket: true,
    autoPairMarkdownSyntax: true,
    autoPairQuote: true,
    bulletListMarker: "-",
    orderListDelimiter: ".",
    tabSize: 4,
    // bullet/list marker width + listIndentation, tab or Daring Fireball Markdown (4 spaces) --> list indentation
    listIndentation: 1,
    frontMatter: true, // Whether to support frontmatter.
    frontmatterType: "-",
    sequenceTheme: "hand", // hand or simple
    mermaidTheme: "default", // dark / forest / default
    vegaTheme: "latimes", // excel / ggplot2 / quartz / vox / fivethirtyeight / dark / latimes
    hideQuickInsertHint: false,
    hideLinkPopup: false,
    autoCheck: false,
    // Whether we should set spellcheck attribute on our container to highlight misspelled words.
    // NOTE: The browser is not able to correct misspelled words words without a custom
    // implementation like in MarkText.
    spellcheckEnabled: false,
    // Markdown extensions
    superSubScript: true,
    footnote: true,
    isGitlabCompatibilityEnabled: false,
    // Move checked task list item to the end of task list.
    autoMoveCheckedToEnd: true,
};
const apis = {
    layout: ["toggleFocusMode"],
    i18n: ["addLocales", "t", "changeLanguage"],
    state: ["setContent", "getContent", "getWordCount"],
    search: ["search", "replace", "searchJumpNext", "searchJumpPrev", "searchJumpIndex", "searchClear"],
    stack: ["undo", "redo", "canRedo", "canUndo"],
    clipboard: ["copyAsMarkdown", "copyAsHtml", "copyAsPlainText", "pasteAsPlainText"],
    event: ["on", "off", "trigger"]
};
class MEditable {
    static defaultOptions = DEFAULT_OPTIONS;
    static instancesSet = new Set();
    static configDefaultOptions(options) {
        this.defaultOptions = { ...DEFAULT_OPTIONS, ...this.defaultOptions, ...options };
        if (typeof options.focusMode !== "undefined") {
            for (let instance of this.instancesSet) {
                instance.toggleFocusMode(options.focusMode);
            }
        }
    }
    static use(Plugin, options) {
        MEPlugin.use(Plugin, options);
    }
    context = {};
    eventListeners = new EventListeners();
    container;
    get selection() { return this.context.editable.selection; }
    get actived() { return this.context.editable.actived; }
    set actived(actived) { this.context.editable.actived = actived; }
    addLocales(resources, lang) { }
    t(key) { return key; }
    changeLanguage(lang) { }
    getCursor() { return this.context.editable.selection.getCursor(); }
    setCursor(cursor) { this.context.editable.selection.setCursor(cursor); }
    scrollBlockIntoView(blockPathOrId) {
        const block = this.context.content.queryBlock(blockPathOrId);
        if (block) {
            block.renderer.nodes.el.scrollIntoView();
        }
    }
    toggleFocusMode(focusMode) { }
    setContent(text, type = "md") { }
    getContent(type) { return Promise.resolve(''); }
    getWordCount() { return 0; }
    search(options) { return { list: [], index: 0 }; }
    replace(options) { return { list: [], index: 0 }; }
    searchJumpNext() { return { list: [], index: 0 }; }
    searchJumpPrev() { return { list: [], index: 0 }; }
    searchJumpIndex() { return { list: [], index: 0 }; }
    searchClear() { return { list: [], index: 0 }; }
    undo() { }
    redo() { }
    canUndo() { return false; }
    canRedo() { return false; }
    copyAsMarkdown() { }
    copyAsHtml() { }
    copyAsPlainText() { }
    pasteAsPlainText() { }
    on(types, handler) { }
    off(types, handler) { }
    trigger(types, ...args) { }
    options;
    constructor(options) {
        this.options = { ...MEditable.defaultOptions, ...options };
        this.container = options.container || document.createElement('div');
        // Init
        Object.entries(Modules).forEach(([moduleName, moduleClass]) => {
            this.context[moduleName] = new moduleClass(this);
        });
        MEditable.instancesSet.add(this);
    }
    setOption(key, value) {
        this.options[key] = value;
    }
    getOption(key) {
        return this.options[key];
    }
    // Call modules to prepare
    async prepare() {
        await Object.keys(this.context).reduce((promise, module) => promise.then(async () => {
            try {
                await this.context[module].prepare();
            }
            catch (e) {
            }
        }), Promise.resolve());
        this.exportAPI();
    }
    exportAPI() {
        Object.keys(apis).forEach((key) => {
            for (const api of apis[key]) {
                this[api] = this.context[key][api].bind(this.context[key]);
            }
        });
    }
    destroy() {
        MEditable.instancesSet.delete(this);
        Object.keys(apis).forEach((key) => {
            for (const api of apis[key]) {
                this[api] = () => {
                    // throw new Error("[MEditable] MEditable instance is destroyed")
                    console.warn(`[MEditable] MEditable instance is destroyed, can't use ${api} API`);
                };
            }
        });
        Object.keys(this.context).reverse().forEach((module) => {
            this.context[module].destroy();
        });
        // Release instances delay 300ms
        setTimeout(() => {
            Object.keys(this.context).reverse().forEach((module) => {
                this.context[module].instance = null;
                delete this.context[module];
            });
        }, 300);
    }
}

export { DEFAULT_OPTIONS, MEditable as default };
