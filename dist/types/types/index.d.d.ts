/*!
 * meditable v0.2.1
 * Github: https://github.com/geekeditor/meditable
 * (c) 2023-2026 montisan <imontisan@gmail.com>
 * Released under the MIT License.
 */
import MERange from '../modules/editable/range.js';
import MESelection from '../modules/editable/selection.js';

interface EventListenersInstance {
    on(
        element: EventTarget,
        eventType: string,
        handler: (event: Event) => void,
        options: boolean | AddEventListenerOptions
    ): string | undefined;
    off(id: string): void;
}
interface MEModuleInstance {
    instance: MEInstance;
    nodes: any;
    prepare: () => Promise<boolean>;
    destroy: () => void;
}
interface MEModuleConstructable {
    new(instance: MEInstance): MEModuleInstance;
}
interface MECommonModules {
    layout: MELayoutModuleInstance;
    editable: MEEditableModuleInstance;
    event: MEEventModuleInstance;
    command: MECommandModuleInstance;
    content: MEContentModuleInstance;
    i18n: MEI18nModuleInstance;
    clipboard: MEClipboardModuleInstance;
    state: MEStateModuleInstance;
    stack: MEStackModuleInstance;
    search: MESearchModuleInstance;
    plugin: MEPluginModuleInstance;
}
type MEContext = { [module: string]: MEModuleInstance; } & MECommonModules;

type MEOptions = {
    container?: HTMLElement;
    focusMode?: boolean;
    // Whether to trim the beginning and ending empty line in code block when open markdown.
    trimUnnecessaryCodeBlockEmptyLines?: boolean;
    preferLooseListItem?: boolean;
    autoPairBracket?: boolean;
    autoPairMarkdownSyntax?: boolean;
    autoPairQuote?: boolean;
    bulletListMarker?: string;
    orderListDelimiter?: string;
    tabSize?: number;
    // bullet/list marker width + listIndentation, tab or Daring Fireball Markdown (4 spaces) --> list indentation
    listIndentation?: number;
    frontMatter?: boolean; // Whether to support frontmatter.
    frontmatterType?: string;
    sequenceTheme?: "hand" | "simple"; // hand or simple
    mermaidTheme?: "default" | "dark" | "forest"; // dark / forest / default
    vegaTheme?: "latimes" | "excel" | "ggplot2" | "quartz" | "vox" | "fivethirtyeight" | "dark"; // excel / ggplot2 / quartz / vox / fivethirtyeight / dark / latimes
    hideQuickInsertHint?: boolean;
    hideLinkPopup?: boolean;
    autoCheck?: boolean;
    // Whether we should set spellcheck attribute on our container to highlight misspelled words.
    // NOTE: The browser is not able to correct misspelled words words without a custom
    // implementation like in MarkText.
    spellcheckEnabled?: boolean;
    // link click handler
    linkClick?: (href: string)=>void;
    // transform the image to local folder, cloud or just return the local path
    imageTransform?: (src: string)=>Promise<string|File>;
    imageUpload?: (file: File)=>Promise<string|null>;

    // Paste content transform
    pasteTransform?: (content: {text: string; html: string})=>{text:string;html:string};

    // svg or img
    diagramHtmlType?: MEDiagramHtmlType | {mermaid?: MEDiagramHtmlType; flowchart?: MEDiagramHtmlType; sequence?: MEDiagramHtmlType; "vega-lite"?: MEDiagramHtmlType; plantuml?: MEDiagramHtmlType};

    staticBlockHtmlRenderer?: (options: MEBlockRendererStaticRenderOptions, renderedHtml: string)=>Promise<string>;
    staticNodeHtmlRenderer?: (options: MENodeRendererStaticRenderOptions, renderedHtml: string)=>Promise<string>;

    // Markdown extensions
    superSubScript?: boolean;
    footnote?: boolean;
    isGitlabCompatibilityEnabled?: boolean;
    // Move checked task list item to the end of task list.
    autoMoveCheckedToEnd?: boolean;

    locale?: {
        lang: string;
        resources?: {[lang: string]: {[key: string]: string}}
    },
}
interface MEInstance {
    readonly context: MEContext;
    readonly eventListeners: EventListenersInstance;
    readonly container: HTMLElement;
    readonly options: MEOptions;
    readonly selection: MESelection;
    actived: boolean;
    toggleFocusMode: (focusMode: boolean) => void;
    setOption: (key: string, value: any) => void;
    getOption: (key: string) => any;
    addLocales: (resources: { [lang: string]: { [key: string]: string } }, lang?: string)=>void;
    t: (key: string)=>string;
    changeLanguage: (lang: string)=>void;
    getCursor: ()=>MECursorState;
    setCursor: (cursor: MECursorState)=>void;
    scrollBlockIntoView: (blockPathOrId: number[] | string)=>void;
    setContent: (text: string, type?: MEContentType) => void;
    getContent: (type?: MEContentType) => Promise<string>;
    getWordCount: () => number;
    search: (options: MESearchOptions)=>MESearchResult;
    replace: (options: MESearchOptions)=>MESearchResult;
    searchJumpNext: ()=>MESearchResult;
    searchJumpPrev: ()=>MESearchResult;
    searchJumpIndex: ()=>MESearchResult;
    searchClear: ()=>MESearchResult;
    undo: () => void;
    redo: () => void;
    canUndo: () => boolean;
    canRedo: () => boolean;
    copyAsMarkdown: ()=>void;
    copyAsHtml: ()=>void;
    copyAsPlainText: ()=>void;
    pasteAsPlainText: ()=>void;
    on: (types: string | string[], handler: Function) => void;
    off: (types: string | string[], handler: Function) => void;
    trigger: (types: string | string[], ...args: any[]) => void;
    destroy: () => void;
}

type MENodeType =
    'strong' |
    'em' |
    'del' |
    'text' |
    'image' |
    'header' |
    'tail_header' |
    'code_fense' |
    'hr' |
    'html_tag' |
    'html_img' |
    'html_ruby' |
    'html_br' |
    'html_valid_tag' |
    'html_comment' |
    'html_escape' |
    'soft_line_break' |
    'hard_line_break' |
    'sup' |
    'sub' |
    'inline_math' |
    'multiple_math' |
    'inline_code' |
    'emoji' |
    'emoji_valid' |
    'auto_link' |
    'auto_link_extension' |
    'link' |
    'link_no_text' |
    'backlash' |
    'footnote_identifier' |
    'reference_definition' |
    'reference_image' |
    'reference_link' |
    'entity_reference'
type MENodeData = {
    type: MENodeType;
    content?: string;
    raw: string;
    actived?: boolean;
    marker?: string;
    tag?: string;
    lineBreak?: string;
    isAtEnd?: boolean;
    spaces?: string;
    openTag?: string;
    closeTag?: string;
    attrs?: any;
    escapeCharacter?: string;
    isLink?: boolean;
    href?: string;
    email?: string;
    www?: string;
    linkType?: string;
    url?: string;
    title?: string;
    hrefAndTitle?: string;
    anchor?: string;
    label?: string;
    leftBracket?: string;
    leftHrefMarker?: string;
    leftTitleSpace?: string;
    rightBracket?: string;
    rightHrefMarker?: string;
    rightTitleSpace?: string;
    titleMarker?: string;
    isFullLink?: boolean;
    alt?: string;
    range: { start: number; end: number }
    children?: MENodeData[]
    ref?: string;
    entityType?: string;
    entityId?: string;
}

interface MENodeInstance extends MEModuleInstance {
    nodes: { el: HTMLElement; };
    type: MENodeType;
    dirty: boolean;
    blockRenderer: MEBlockRendererInstance | null;
    render: (data: MENodeData) => HTMLElement;
}

type MENodeRendererStaticRenderOptions = {innerHTML?: string; data: MENodeData; labels: Map<string, { href: string; title: string }>}

type MEBlockType = 'document' |
    'frontmatter' |
    'paragraph' |
    'atx-heading1' |
    'atx-heading2' |
    'atx-heading3' |
    'atx-heading4' |
    'atx-heading5' |
    'atx-heading6' |
    'setext-heading1' |
    'setext-heading2' |
    'block-quote' |
    'code-block' |
    'html-block' |
    'language' |
    'code' |
    'thematic-break' |
    'math-block' |
    'diagram-block' |
    'order-list' |
    'bullet-list' |
    'list-item' |
    'task-list' |
    'task-list-item' |
    'table' |
    'table-thead' |
    'table-tbody' |
    'table-tr' |
    'table-th' |
    'table-td' |
    'frontmatter' |
    'staff';
type MEBlockData = {
    id: string;
    type: MEBlockType;
    meta?: any;
    text?: string;
    children?: MEBlockData[];
}

type MEDiagramHtmlType = 'svg' | 'img'
type MEBlockRendererStaticRenderOptions = {innerHTML?: string; diagramHtmlType?: MEDiagramHtmlType; data: MEBlockData}

type MEBlockRendererRenderOptions = { text?: string, meta?: any, cursor?: MECursorState | null, checkUpdate?: boolean }

interface MEBlockRendererInstance extends MEModuleInstance {
    nodes: { el: HTMLElement; holder: HTMLElement };
    readonly text: string;
    readonly meta: any;
    readonly datas: MENodeData[];
    readonly anchor: MEBlockInstance;
    block: MEBlockInstance;
    children: MENodeInstance[];
    isInlineRendered?: boolean;
    mouseDownHandler: (event: Event) => void;
    clickHandler: (event: Event) => void;
    inputHandler: (event: InputEvent) => void;
    keydownHandler: (event: KeyboardEvent) => void;
    keyupHandler: (event: KeyboardEvent) => void;
    composeHandler: (event: CompositionEvent) => void;
    render: (options: MEBlockRendererRenderOptions) => boolean;
    forceUpdate: () => void;
    setCursor: (options?: { anchor?: { offset: number }, focus?: { offset: number }, scrollToView?: boolean }) => void;
    getCursor: () => { anchor: { offset: number }, focus: { offset: number }, start: { offset: number }, end: { offset: number }, direction: string } | null;
}

type MEBlockRenderOptions = { data: MEBlockData, parent?: MEBlockInstance | null, cursor?: MECursorState | null }
interface MEBlockInstance extends MEModuleInstance {
    id: string;
    path: number[];
    type: MEBlockType;
    data: MEBlockData;
    root: MEBlockInstance;
    parent: MEBlockInstance | null;
    previous: MEBlockInstance | null;
    next: MEBlockInstance | null;
    firstChild: MEBlockInstance | null;
    lastChild: MEBlockInstance | null;
    outMostBlock: MEBlockInstance | null;
    children: MEBlockInstance[];
    nodes: { el: HTMLElement; holder: HTMLElement };
    actived: boolean;
    focused: boolean;
    selected: boolean;
    dropTarget: boolean;
    renderer: MEBlockRendererInstance;
    index: number;
    isFirstChild: boolean;
    isLastChild: boolean;
    isOnlyChild: boolean;
    isOutMostBlock: boolean;
    isRoot: boolean;
    queryBlock: (path: number[] | string) => MEBlockInstance | undefined;
    findBlock: (el: HTMLElement | Node) => MEBlockInstance | undefined;
    render: (options: MEBlockRenderOptions) => HTMLElement;
    insert: (options?: {
        data?: MEBlockData;
        index?: number;
        needToFocus?: boolean;
        focus?: { offset: number };
        replace?: boolean;
    }) => MEBlockInstance | null;
    insertAtEnd: () => MEBlockInstance;
    append: (options?: {
        data?: MEBlockData;
        needToFocus?: boolean;
        focus?: { offset: number };
    }) => MEBlockInstance | null;
    insertAdjacent: (position: "beforebegin" | "afterbegin" | "beforeend" | "afterend", options?: {
        data?: MEBlockData;
        needToFocus?: boolean;
        focus?: { offset: number };
    }) => MEBlockInstance | null;
    replaceWith: (options: {
        data?: MEBlockData;
        needToFocus?: boolean;
        focus?: { offset: number };
    }) => MEBlockInstance | null;
    firstContentInDescendant: () => MEBlockInstance;
    lastContentInDescendant: () => MEBlockInstance;
    previousContentInContext: () => MEBlockInstance | null;
    nextContentInContext: () => MEBlockInstance | null;
    previousInContext: () => MEBlockInstance | null;
    nextInContext: () => MEBlockInstance | null;
    remove: () => void;
    getAncestors: () => MEBlockInstance[];
    getCommonAncestors: (block: MEBlockInstance) => MEBlockInstance[];
    closestBlock: (blockType: MEBlockType) => MEBlockInstance | null;
    farthestBlock: (blockType: MEBlockType) => MEBlockInstance | null;
    contains: (child: MEBlockInstance) => boolean;
}

interface MEI18nModuleInstance extends MEBlockInstance {
    addLocales: (resources: { [lang: string]: { [key: string]: string } }, lang?: string)=>void;
    t: (key: string)=>string;
    changeLanguage: (lang: string)=>void;
}

interface MELayoutNodes {
    holder: HTMLElement;
    wrapper: HTMLElement;
    scroller: HTMLElement;
    editor: HTMLElement;
    zone: HTMLElement;
    content: HTMLElement;
    presentation: HTMLElement;
    refactorDocumentOrShadowRoot: ShadowRoot;
}

interface MELayoutModuleInstance extends MEModuleInstance {
    readonly nodes: MELayoutNodes;
    readonly scrollerState: {scrollTop: number; scrollTopBlockId?: string}
    toggleFocusMode: (focusMode: boolean) => void;
    viewImage: (container: HTMLElement) => void;
}


type MEContentType = 'md' | 'html' | 'text'
interface MEContentModuleInstance extends MEBlockInstance {
    dropTargetBlock: MEBlockInstance;
    clearDropTargetBlock: ()=>void;
    setCursorAtBegin: ()=>void;
    setCursorAtEnd: ()=>void;
    setDefaultCursor: ()=>void;
}

interface MEClipboardModuleInstance extends MEModuleInstance {
    copyAsMarkdown: ()=>void;
    copyAsHtml: ()=>void;
    copyAsPlainText: ()=>void;
    pasteAsPlainText: ()=>void;
    copyPlainText: (text: string)=>void;
    processDataTransfer: (anchorBlock: MEBlockInstance, dataTransfer: DataTransfer, isDragDrop?: boolean)=>Promise<void>;
}

type MEStateScene = { state: MEBlockData, cursor: MECursorState }
interface MEStateModuleInstance extends MEModuleInstance {
    labels: Map<string, { href: string; title: string }>;
    setContent: (content: string, type?: MEContentType) => void;
    getContent: (type?: MEContentType) => Promise<string>;
    getWordCount: () => number;
    getScene: () => MEStateScene;
    setScene: (scene: MEStateScene) => void;
}

interface MEStackModuleInstance extends MEModuleInstance {
    undo: () => void;
    redo: () => void;
    reset: () => void;
    canUndo: () => boolean;
    canRedo: () => boolean;
}


interface MESearchOptions {
    searchKey: string;
    caseSensitive?: boolean;
    all: boolean;
    dir: number;
    replaceKey?: string;
    replace?: boolean;
    replaceType?: 'text' | 'format';
    replaceFormat?: string;
}

interface MESearchResult {
    list: MERange[];
    index: number;
}

interface MESearchModuleInstance extends MEModuleInstance {
    search: (options: MESearchOptions)=>MESearchResult;
    replace: (options: MESearchOptions)=>MESearchResult;
    searchJumpNext: ()=>MESearchResult;
    searchJumpPrev: ()=>MESearchResult;
    searchJumpIndex: ()=>MESearchResult;
    searchClear: ()=>MESearchResult;
}

type MECursorState = {
    anchor: { offset: number };
    focus: { offset: number };
    anchorBlock?: MEBlockInstance | null;
    anchorBlockId?: string;
    focusBlock?: MEBlockInstance | null;
    focusBlockId?: string;
    anchorPath?: number[];
    focusPath?: number[];
    isCollapsed?: boolean;
    isSameBlock?: boolean;
    direction?: string;
    scrollTop?: number;
    scrollTopBlockId?: string;
}

interface MEEditableModuleInstance extends MEModuleInstance {
    selection: MESelection;
    document: Document;
    window: Window;
    rootNode: HTMLElement;
    holder: HTMLElement;
    actived: boolean;
    enabled: boolean;
    mount: (el: HTMLElement, selection?: Selection | null) => MEEditableModuleInstance;
}

interface MEEventModuleInstance extends MEModuleInstance {
    on: (types: string | string[], handler: Function) => void;
    off: (types: string | string[], handler: Function) => void;
    trigger: (types: string | string[], ...args: any[]) => void;
    selectionChange: () => void;
}


interface MEShortcutData {
    data?: any;
    handler?: (event: KeyboardEvent, data?: any) => void;
}

interface MECommandModuleInstance extends MEModuleInstance {
    registerCommand: (command: MECommandObj | CommandFunction) => boolean;
    command: (cmdName: string) => MECommandObj | undefined;
    execCommand: (cmd: string, ...args: any[]) => any;
    queryCommandState: (cmd: string, ...args: any[]) => number;
    queryCommandValue: (cmd: string, ...args: any[]) => any;
}

interface MECommandObj {
    defaultOptions?: { [key: string]: any };
    shortcutKeys?: { [key: string]: MEShortcutData };
    ignoreContentChange?: boolean;
    notNeedUndo?: boolean;
    cmdName: string;
    execCommand: (cmd: string, ...args) => any;
    queryCommandValue?: (cmd: string, ...args) => any;
    queryCommandState?: (cmd: string, ...args) => number;
    queryCommandEnabled?: (cmd: string) => boolean;
}


type CommandFunction = () => MECommandObj | MECommandObj[];
interface MEPluginModuleInstance extends MEModuleInstance {
    plugins: {[key: string]: MEPluginInstance}
}

type MEPluginOptions = {[key: string]: any}
interface MEPluginInstance extends MEModuleInstance {
}
interface MEPluginConstructable extends MEModuleConstructable {
    pluginName: string;
    new(instance: MEInstance, options?: MEPluginOptions): MEPluginInstance;
}

interface MEOutlineItem {
    id: string;
    text: string;
    type: MEBlockType;
    match?: RegExpMatchArray | null
}

export { CommandFunction, EventListenersInstance, MEBlockData, MEBlockInstance, MEBlockRenderOptions, MEBlockRendererInstance, MEBlockRendererRenderOptions, MEBlockRendererStaticRenderOptions, MEBlockType, MEClipboardModuleInstance, MECommandModuleInstance, MECommandObj, MECommonModules, MEContentModuleInstance, MEContentType, MEContext, MECursorState, MEDiagramHtmlType, MEEditableModuleInstance, MEEventModuleInstance, MEI18nModuleInstance, MEInstance, MELayoutModuleInstance, MELayoutNodes, MEModuleConstructable, MEModuleInstance, MENodeData, MENodeInstance, MENodeRendererStaticRenderOptions, MENodeType, MEOptions, MEOutlineItem, MEPluginConstructable, MEPluginInstance, MEPluginModuleInstance, MEPluginOptions, MESearchModuleInstance, MESearchOptions, MESearchResult, MEShortcutData, MEStackModuleInstance, MEStateModuleInstance, MEStateScene };
