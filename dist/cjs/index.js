/*!
 * meditable v0.2.1
 * Github: https://github.com/geekeditor/meditable
 * (c) 2023-2026 montisan <imontisan@gmail.com>
 * Released under the MIT License.
 */
'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var listeners = require('./utils/listeners.js');
var index$3 = require('./modules/index.js');
var parser = require('./modules/editable/parser.js');
var markdownToState = require('./modules/state/markdownToState.js');
var stateToMarkdown = require('./modules/state/stateToMarkdown.js');
var htmlToMarkdown = require('./modules/state/htmlToMarkdown.js');
var stateToHtml = require('./modules/state/stateToHtml.js');
var stateToPlainText = require('./modules/state/stateToPlainText.js');
var index = require('./modules/content/inlineRenderers/tokenizer/index.js');
var outline = require('./utils/outline.js');
var plugin = require('./modules/plugin.js');
var markdownHtml = require('./utils/markdownHtml.js');
var index$1 = require('./plugins/contextMenu/index.js');
var index$2 = require('./plugins/bubbleToolbar/index.js');

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
        plugin.use(Plugin, options);
    }
    context = {};
    eventListeners = new listeners();
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
        Object.entries(index$3).forEach(([moduleName, moduleClass]) => {
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

exports.HTMLParser = parser.default;
exports.MarkdownToState = markdownToState;
exports.StateToMarkdown = stateToMarkdown;
exports.HtmlToMarkdown = htmlToMarkdown;
exports.StateToHtml = stateToHtml;
exports.StateToPlainText = stateToPlainText;
exports.tokenizer = index.tokenizer;
exports.filterOutline = outline.filterOutline;
exports.flattenToOutline = outline.flattenToOutline;
exports.htmlToMarkdown = markdownHtml.htmlToMarkdown;
exports.markdownToHtml = markdownHtml.markdownToHtml;
exports.MEPluginContextMenu = index$1;
exports.MEPluginBubbleToolbar = index$2;
exports.DEFAULT_OPTIONS = DEFAULT_OPTIONS;
exports.default = MEditable;
