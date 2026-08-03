/*!
 * meditable v0.2.1
 * Github: https://github.com/geekeditor/meditable
 * (c) 2023-2026 montisan <imontisan@gmail.com>
 * Released under the MIT License.
 */
import { MEBlockData } from '../../types/index.d.js';

/**
 * Hi contributors!
 *
 * Before you edit or update codes in this file,
 * make sure you have read this bellow:
 * Commonmark Spec: https://spec.commonmark.org/0.29/
 * GitHub Flavored Markdown Spec: https://github.github.com/gfm/
 * Pandoc Markdown: https://pandoc.org/MANUAL.html#pandocs-markdown
 * The output markdown needs to obey the standards of these Spec.
 */

interface IExportMarkdownOptions {
    listIndentation: number | string;
    isGitlabCompatibilityEnabled: boolean;
}
declare class StateToMarkdown {
    private listType;
    private isLooseParentList;
    private isGitlabCompatibilityEnabled;
    private listIndentation;
    private listIndentationCount;
    constructor({ listIndentation, isGitlabCompatibilityEnabled, }?: IExportMarkdownOptions);
    generate(states: MEBlockData[]): string;
    convertStatesToMarkdown(states: MEBlockData[], indent?: string, listIndent?: string): string;
    insertLineBreak(result: any, indent: any): void;
    serializeFrontMatter(state: any): string;
    serializeTextParagraph(state: any, indent: any): string;
    serializeAtxHeading(state: any, indent: any): string;
    serializeSetextHeading(state: any, indent: any): string;
    serializeCodeBlock(state: any, indent: any): string;
    serializeHtmlBlock(state: any, indent: any): string;
    serializeMathBlock(state: any, indent: any): string;
    serializeDiagramBlock(state: any, indent: any): string;
    serializeBlockquote(state: any, indent: any): string;
    serializeTable(state: any, indent: any): string;
    serializeList(state: any, indent: any, listIndent: any): string;
    serializeListItem(state: any, indent: any): string;
}

export { IExportMarkdownOptions, StateToMarkdown as default };
