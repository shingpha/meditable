/*!
 * meditable v0.2.1
 * Github: https://github.com/geekeditor/meditable
 * (c) 2023-2026 montisan <imontisan@gmail.com>
 * Released under the MIT License.
 */
type MENativeNode = Node | Node & ParentNode | ChildNode | Text

interface MEBookmark {
    start: string | HTMLSpanElement;
    end: string | HTMLSpanElement | null;
    id: string | undefined;
}

interface MEAddress {
    startAddress: number[];
    endAddress?: number[];
    collapsed: boolean;
}

export { MEAddress, MEBookmark, MENativeNode };
