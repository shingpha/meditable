/*!
 * meditable v0.2.1
 * Github: https://github.com/geekeditor/meditable
 * (c) 2023-2026 montisan <imontisan@gmail.com>
 * Released under the MIT License.
 */
import MESelection from './modules/editable/selection.js';
import { MEOptions, MEInstance, MEPluginConstructable, MEPluginOptions, MEContext, MECursorState, MEContentType, MESearchOptions } from './types/index.d.js';
import EventListeners from './utils/listeners.js';
export { default as HTMLParser } from './modules/editable/parser.js';
export { default as MarkdownToState } from './modules/state/markdownToState.js';
export { default as StateToMarkdown } from './modules/state/stateToMarkdown.js';
export { default as HtmlToMarkdown } from './modules/state/htmlToMarkdown.js';
export { default as StateToHtml } from './modules/state/stateToHtml.js';
export { default as StateToPlainText } from './modules/state/stateToPlainText.js';
export { tokenizer } from './modules/content/inlineRenderers/tokenizer/index.js';
export { filterOutline, flattenToOutline } from './utils/outline.js';
export { MarkdownToHtmlOptions, htmlToMarkdown, markdownToHtml } from './utils/markdownHtml.js';
export { default as MEPluginContextMenu } from './plugins/contextMenu/index.js';
export { default as MEPluginBubbleToolbar } from './plugins/bubbleToolbar/index.js';

declare const DEFAULT_OPTIONS: MEOptions;
declare class MEditable implements MEInstance {
    static defaultOptions: MEOptions;
    static instancesSet: Set<MEInstance>;
    static configDefaultOptions(options: MEOptions): void;
    static use(Plugin: MEPluginConstructable, options?: MEPluginOptions): void;
    readonly context: MEContext;
    readonly eventListeners: EventListeners;
    readonly container: HTMLElement;
    get selection(): MESelection;
    get actived(): boolean;
    set actived(actived: boolean);
    addLocales(resources: {
        [lang: string]: {
            [key: string]: string;
        };
    }, lang?: string): void;
    t(key: string): string;
    changeLanguage(lang: string): void;
    getCursor(): MECursorState;
    setCursor(cursor: MECursorState): void;
    scrollBlockIntoView(blockPathOrId: number[] | string): void;
    toggleFocusMode(focusMode: boolean): void;
    setContent(text: string, type?: MEContentType): void;
    getContent(type?: MEContentType): Promise<string>;
    getWordCount(): number;
    search(options: MESearchOptions): {
        list: any[];
        index: number;
    };
    replace(options: MESearchOptions): {
        list: any[];
        index: number;
    };
    searchJumpNext(): {
        list: any[];
        index: number;
    };
    searchJumpPrev(): {
        list: any[];
        index: number;
    };
    searchJumpIndex(): {
        list: any[];
        index: number;
    };
    searchClear(): {
        list: any[];
        index: number;
    };
    undo(): void;
    redo(): void;
    canUndo(): boolean;
    canRedo(): boolean;
    copyAsMarkdown(): void;
    copyAsHtml(): void;
    copyAsPlainText(): void;
    pasteAsPlainText(): void;
    on(types: string | string[], handler: Function): void;
    off(types: string | string[], handler: Function): void;
    trigger(types: string | string[], ...args: any[]): void;
    readonly options: MEOptions;
    constructor(options: MEOptions);
    setOption(key: string, value: any): void;
    getOption(key: string): any;
    prepare(): Promise<void>;
    private exportAPI;
    destroy(): void;
}

export { DEFAULT_OPTIONS, MEditable as default };
