/*!
 * meditable v0.2.1
 * Github: https://github.com/geekeditor/meditable
 * (c) 2023-2026 montisan <imontisan@gmail.com>
 * Released under the MIT License.
 */
import { convertIfNeeded } from '../../../utils/convert.js';

function handleBackspaceInParagraph() {
    const renderer = this;
    const { block } = renderer;
    const previousContentBlock = block.previousContentInContext();
    // Fix 21: 文档首个块且光标已在最前端时，Backspace 不应删除当前块或合并后续块
    // （常规预期：无操作）。若当前块或前一块包含实体引用节点，合并/重转换会丢失
    // 实体，同样不执行破坏式合并，保留实体。
    const hasEntityRef = (b) => !!(b && b.renderer && b.renderer.datas && b.renderer.datas.some((t) => t.type === 'entity_reference'));
    if (!previousContentBlock) {
        return false;
    }
    if (hasEntityRef(block) || hasEntityRef(previousContentBlock)) {
        return false;
    }
    const { text: oldText } = previousContentBlock.renderer;
    const offset = oldText.length;
    const text = oldText + renderer.text;
    const focus = { offset };
    previousContentBlock.renderer.render({ text, cursor: { anchor: focus, focus, focusBlock: previousContentBlock, anchorBlock: previousContentBlock } });
    renderer.block.remove();
    previousContentBlock.renderer.setCursor({ focus });
    if (previousContentBlock.type === 'paragraph') {
        convertIfNeeded.call(previousContentBlock.renderer, text);
    }
    return true;
}
function handleBackspaceInBlockQuote() {
    const renderer = this;
    const { block } = renderer;
    const blockQuote = block.parent;
    if (!block.isOnlyChild && !block.isFirstChild) {
        return handleBackspaceInParagraph.call(renderer);
    }
    if (block.isOnlyChild) {
        blockQuote?.replaceWith({ data: block.data, needToFocus: true });
    }
    else if (block.isFirstChild) {
        const cloneParagraph = block.data;
        blockQuote?.insertAdjacent("beforebegin", { data: cloneParagraph, needToFocus: true });
        block.remove();
    }
    return true;
}
function handleBackspaceInList() {
    const renderer = this;
    const { block } = renderer;
    const listItem = block.parent;
    const list = listItem?.parent;
    if (!block.isFirstChild) {
        return handleBackspaceInParagraph.call(renderer);
    }
    if (!listItem || !list) {
        return false;
    }
    if (listItem.isOnlyChild) {
        listItem.children.forEach((node, i) => {
            const paragraph = node.data;
            list.insertAdjacent("beforebegin", { data: paragraph, needToFocus: i === 0 });
        });
        list.remove();
    }
    else if (listItem.isFirstChild) {
        listItem.children.forEach((node, i) => {
            const paragraph = node.data;
            list.insertAdjacent("beforebegin", { data: paragraph, needToFocus: i === 0 });
        });
        listItem.remove();
    }
    else {
        const previousListItem = listItem.previous;
        listItem.children.forEach((node, i) => {
            const paragraph = node.data;
            previousListItem?.append({ data: paragraph, needToFocus: i === 0 });
        });
        listItem.remove();
    }
    return true;
}

export { handleBackspaceInBlockQuote, handleBackspaceInList, handleBackspaceInParagraph };
