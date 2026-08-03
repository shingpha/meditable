/*!
 * meditable v0.2.1
 * Github: https://github.com/geekeditor/meditable
 * (c) 2023-2026 montisan <imontisan@gmail.com>
 * Released under the MIT License.
 */
interface MEVNodeInstance {
    type: () => string;
    data: () => string;
    tagName: () => string;
    parentNode: () => MEVNodeInstance | null;
    attrs: () => {
        [key: string]: string;
    };
    setAttrs: (attrs: {
        [key: string]: string;
    }) => void;
    children: () => MEVNodeInstance[];
    setTagName: (tagName: string) => void;
    setParentNode: (parentNode: MEVNodeInstance | null) => void;
    outerHTML: (formatter: boolean) => string;
    innerHTML: (htmlStr?: string) => string | MEVNodeInstance;
    innerText: (textStr?: string, noTrans?: boolean) => string | MEVNodeInstance;
    firstChild: () => MEVNodeInstance | undefined;
    lastChild: () => MEVNodeInstance | undefined;
    previousSibling: () => MEVNodeInstance | undefined;
    nextSibling: () => MEVNodeInstance | undefined;
    replaceChild: (target: MEVNodeInstance, source: MEVNodeInstance) => MEVNodeInstance | undefined;
    appendChild: (node: MEVNodeInstance) => MEVNodeInstance | undefined;
    removeChild: (node: MEVNodeInstance, keepChildren?: boolean) => MEVNodeInstance | undefined;
    remove: () => void;
    insertBefore: (target: MEVNodeInstance, source: MEVNodeInstance) => MEVNodeInstance | undefined;
    insertAfter: (target: MEVNodeInstance, source: MEVNodeInstance) => MEVNodeInstance | undefined;
    getNodeById: (id: string) => MEVNodeInstance | undefined;
    attr: (attrName: any, attrValue?: string) => string | undefined;
    removeAttr: (attrName?: string) => void;
    css: (name: any, val?: string) => string | undefined;
    applyStyle: (nativeNode: HTMLElement) => void;
    traversal: (fn: Function) => void;
}
interface MEVNodeInstanceOptions {
    type: string;
    data?: string;
    tagName?: string;
    parentNode?: MEVNodeInstance;
    attrs?: {
        [key: string]: string;
    };
    children?: MEVNodeInstance[];
}
declare class MEVNode implements MEVNodeInstance {
    private _type;
    private _data;
    private _tagName;
    private _parentNode;
    private _attrs;
    private _children;
    static createElement(htmlOrTag: string): MEVNodeInstance | MEVNode;
    static createText(data: string, noTrans?: boolean): MEVNode;
    static createComment(data: string): MEVNode;
    constructor(obj: MEVNodeInstanceOptions);
    type(): string;
    data(): string;
    tagName(): string;
    parentNode(): MEVNodeInstance;
    attrs(): {
        [key: string]: string;
    };
    setAttrs(attrs: {
        [key: string]: string;
    }): void;
    children(): MEVNodeInstance[];
    setTagName(tagName: string): void;
    setParentNode(parentNode: MEVNodeInstance | null): void;
    outerHTML(formatter?: boolean): string;
    innerHTML(htmlStr?: string): string | this;
    innerText(textStr?: string, noTrans?: boolean): string | this;
    firstChild(): MEVNodeInstance;
    lastChild(): MEVNodeInstance;
    previousSibling(): MEVNodeInstance;
    nextSibling(): MEVNodeInstance;
    replaceChild(target: MEVNodeInstance, source: MEVNodeInstance): MEVNodeInstance;
    appendChild(node: MEVNodeInstance): MEVNodeInstance;
    removeChild(node: MEVNodeInstance, keepChildren?: boolean): any;
    remove(): void;
    insertBefore(target: MEVNodeInstance, source: MEVNodeInstance): MEVNodeInstance;
    insertAfter(target: MEVNodeInstance, source: MEVNodeInstance): MEVNodeInstance;
    getNodeById(id: string): any;
    getNodesByTagNames(tagNames: string): MEVNodeInstance[];
    index(): number;
    attr(attrName: any, attrValue?: string | null): string;
    removeAttr(attrName?: string): void;
    css(name: any, val?: string): string;
    applyStyle(nativMEVNode: HTMLElement): void;
    traversal(fn: Function): this;
}
declare function HTMLParser(htmlStr: string, removeBlank?: boolean): MEVNode;

export { MEVNode, MEVNodeInstance, MEVNodeInstanceOptions, HTMLParser as default };
