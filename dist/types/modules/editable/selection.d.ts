/*!
 * meditable v0.2.1
 * Github: https://github.com/geekeditor/meditable
 * (c) 2023-2026 montisan <imontisan@gmail.com>
 * Released under the MIT License.
 */
import MERange from './range.js';
import MEModule from '../module.js';
import { MEInstance, MECursorState } from '../../types/index.d.js';

declare class MESelection extends MEModule {
    private _document;
    private _root;
    private _rootDocNode;
    private _ranges;
    private _cachedRange;
    private _cachedStartElement;
    private _cachedStartElementPath;
    private _cachedCursor;
    private _bakRange;
    constructor(document: HTMLDocument, root: HTMLElement, instance: MEInstance);
    private get nativeSelection();
    private getCacheRange;
    getRange(): MERange;
    cache(): void;
    restore(): void;
    clearCache(): void;
    get cachedRange(): MERange;
    get cachedCursor(): MECursorState;
    getRangeAt(index: number): MERange;
    addRange(range: MERange): void;
    removeAllRanges(): void;
    get isCollapsed(): boolean;
    get rangeCount(): number;
    get exists(): boolean;
    get anchorNode(): Node;
    get focusNode(): Node;
    get anchorElement(): Node;
    get focusOffset(): number;
    get anchorOffset(): number;
    get rangeRect(): DOMRect;
    get textContent(): string;
    get cursor(): MECursorState;
    getCursor(): MECursorState;
    setCursor(cursor: MECursorState): void;
    setAnchor(node: Node, offset?: number): DOMRect;
    setFocus(node: Node, offset?: number): void;
    selectNode(node: Node): DOMRect;
    select(startNode: Node, startOffset: number, endNode?: Node, endOffset?: number): DOMRect;
}

export { MESelection as default };
