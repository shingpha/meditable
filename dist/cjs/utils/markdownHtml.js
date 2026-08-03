/*!
 * meditable v0.2.1
 * Github: https://github.com/geekeditor/meditable
 * (c) 2023-2026 montisan <imontisan@gmail.com>
 * Released under the MIT License.
 */
'use strict';

var markdownToState = require('../modules/state/markdownToState.js');
var stateToHtml = require('../modules/state/stateToHtml.js');
var htmlToMarkdown$1 = require('../modules/state/htmlToMarkdown.js');

const defaultMarkdownOptions = {
    footnote: false,
    isGitlabCompatibilityEnabled: false,
    superSubScript: false,
    trimUnnecessaryCodeBlockEmptyLines: false,
    frontMatter: true,
};
function resolveMarkdownOptions(options) {
    const o = { ...defaultMarkdownOptions };
    if (!options)
        return o;
    if (options.footnote !== undefined)
        o.footnote = options.footnote;
    if (options.isGitlabCompatibilityEnabled !== undefined)
        o.isGitlabCompatibilityEnabled = options.isGitlabCompatibilityEnabled;
    if (options.superSubScript !== undefined)
        o.superSubScript = options.superSubScript;
    if (options.trimUnnecessaryCodeBlockEmptyLines !== undefined) {
        o.trimUnnecessaryCodeBlockEmptyLines = options.trimUnnecessaryCodeBlockEmptyLines;
    }
    if (options.frontMatter !== undefined)
        o.frontMatter = options.frontMatter;
    return o;
}
/**
 * 将 Markdown 转为 HTML（内部：`markdownToState` → `stateToHtml`，与 `MEState.getContent('html')` 管线一致）。
 */
async function markdownToHtml(markdown, options) {
    const md = resolveMarkdownOptions(options);
    const markdownToState$1 = new markdownToState(md);
    const stateToHtml$1 = new stateToHtml({
        diagramHtmlType: options?.diagramHtmlType,
        staticNodeHtmlRenderer: options?.staticNodeHtmlRenderer,
        staticBlockHtmlRenderer: options?.staticBlockHtmlRenderer,
    });
    const data = markdownToState$1.generate(markdown);
    return stateToHtml$1.generate(data.children || []);
}
/**
 * 将 HTML 转为 Markdown（封装 `HtmlToMarkdown`）。
 * @param keeps 传给 Turndown 插件的保留规则列表，与 `HtmlToMarkdown#generate` 一致。
 */
function htmlToMarkdown(html, turndownOptions, keeps = []) {
    return new htmlToMarkdown$1(turndownOptions).generate(html, keeps);
}

exports.htmlToMarkdown = htmlToMarkdown;
exports.markdownToHtml = markdownToHtml;
