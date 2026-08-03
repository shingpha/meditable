/*!
 * meditable v0.2.1
 * Github: https://github.com/geekeditor/meditable
 * (c) 2023-2026 montisan <imontisan@gmail.com>
 * Released under the MIT License.
 */
import { MENativeNode, MEBookmark, MEAddress } from './dom.d.js';
import MESelection from './selection.js';

declare class MERange {
    private _document;
    private _root;
    private _selection;
    collapsed: boolean;
    startContainer: MENativeNode | null;
    endContainer: MENativeNode | null;
    startOffset: number;
    endOffset: number;
    constructor(document: HTMLDocument, root: HTMLElement, selection: MESelection);
    document(): HTMLDocument;
    cloneRange(): MERange;
    cloneContents(): DocumentFragment;
    deleteContents(): this;
    extractContents(): DocumentFragment;
    setStart(node: MENativeNode | null, offset: number): MERange;
    setEnd(node: MENativeNode | null, offset: number): MERange;
    setStartAfter(node: Node): MERange;
    setStartBefore(node: Node): MERange;
    setEndAfter(node: Node): MERange;
    setEndBefore(node: Node): MERange;
    setStartAtFirst(node: MENativeNode): MERange;
    setStartAtLast(node: MENativeNode): MERange;
    setEndAtFirst(node: MENativeNode): MERange;
    setEndAtLast(node: MENativeNode): MERange;
    selectNode(node: Node): MERange;
    selectNodeContents(node: MENativeNode): MERange;
    getCommonAncestor(includeSelf?: boolean, ignoreTextNode?: boolean): any;
    enlargeBoundarySuitably(): this;
    shrinkBoundaryMinimality(ingoreEnd?: boolean): this;
    shrinkBoundarySuitably(): this;
    txtToElmBoundary(ignoreCollapsed?: boolean): this;
    trimBoundary(ignoreEnd?: boolean): this;
    enlargeBoundary(toBlock: boolean, stopFn?: Function): this;
    enlargeToBlockElm(ignoreEnd: boolean): this;
    insertNode(node: MENativeNode): MERange;
    applyInlineStyle(tagName: string, attrs?: any, list?: Node[]): this;
    removeInlineStyle(tagNames: (string[]) | string): this;
    applyParagraphStyle(tagName: string, attrs: any, override?: boolean): this;
    applyJustify(align: any): this;
    collapse(toStart?: boolean): this;
    getClosedNode(): any;
    scrollToView(win: Window, offset: number): this;
    inFillChar(): boolean;
    createBookmark(serialize?: string, same?: boolean): {
        start: string | HTMLElement;
        end: string | HTMLSpanElement;
        id: string;
    };
    moveToBookmark(bookmark: MEBookmark): this;
    createAddress(ignoreEnd?: boolean, ignoreTxt?: boolean): MEAddress;
    moveToAddress(addr: MEAddress, ignoreEnd?: boolean): this;
    equals(rng: MERange): boolean;
    traversal(doFn: Function, filterFn: Function): this;
    setCursor(toEnd?: boolean, noFillData?: boolean): this;
    select(notInsertFillData?: boolean): this;
    getBoundingClientRect(): DOMRect;
}

export { MERange as default };
