/*!
 * meditable v0.2.1
 * Github: https://github.com/geekeditor/meditable
 * (c) 2023-2026 montisan <imontisan@gmail.com>
 * Released under the MIT License.
 */
import HtmlToMarkdown from '../modules/state/htmlToMarkdown.js';
import { MEOptions } from '../types/index.d.js';

/**
 * 与编辑器内「Markdown → 文档状态 → HTML」一致的配置子集。
 */
type MarkdownToHtmlOptions = Pick<MEOptions, "footnote" | "isGitlabCompatibilityEnabled" | "superSubScript" | "trimUnnecessaryCodeBlockEmptyLines" | "frontMatter" | "diagramHtmlType" | "staticNodeHtmlRenderer" | "staticBlockHtmlRenderer">;
/**
 * 将 Markdown 转为 HTML（内部：`markdownToState` → `stateToHtml`，与 `MEState.getContent('html')` 管线一致）。
 */
declare function markdownToHtml(markdown: string, options?: Partial<MarkdownToHtmlOptions>): Promise<string>;
/**
 * 将 HTML 转为 Markdown（封装 `HtmlToMarkdown`）。
 * @param keeps 传给 Turndown 插件的保留规则列表，与 `HtmlToMarkdown#generate` 一致。
 */
declare function htmlToMarkdown(html: string, turndownOptions?: ConstructorParameters<typeof HtmlToMarkdown>[0], keeps?: Parameters<HtmlToMarkdown["generate"]>[1]): string;

export { MarkdownToHtmlOptions, htmlToMarkdown, markdownToHtml };
