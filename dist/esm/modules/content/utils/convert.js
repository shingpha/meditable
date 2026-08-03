/*!
 * meditable v0.2.1
 * Github: https://github.com/geekeditor/meditable
 * (c) 2023-2026 montisan <imontisan@gmail.com>
 * Released under the MIT License.
 */
import { generateId } from '../../../utils/utils.js';

const INLINE_UPDATE_FRAGMENTS = [
    '(?:^|\n) {0,3}([*+-] {1,4})', // Bullet list
    '^(\\[[x ]{1}\\] {1,4})', // Task list **match from beginning**
    '(?:^|\n) {0,3}(\\d{1,9}(?:\\.|\\)) {1,4})', // Order list
    '(?:^|\n) {0,3}(#{1,6})(?=\\s{1,}|$)', // ATX headings
    '^(?:[\\s\\S]+?)\\n {0,3}(\\={3,}|\\-{3,})(?= {1,}|$)', // Setext headings **match from beginning**
    '(?:^|\n) {0,3}(>)(?= ).+', // Block quote (Fix 8: 裸 > 不触发，需紧跟空格)
    '^( {4,})', // Indent code **match from beginning**
    // '^(\\[\\^[^\\^\\[\\]\\s]+?(?<!\\\\)\\]: )', // Footnote **match from beginning**
    '(?:^|\n) {0,3}((?:\\* *\\* *\\*|- *- *-|_ *_ *_)[ \\*\\-\\_]*)(?=\n|$)' // Thematic break
];
const INLINE_UPDATE_REG = new RegExp(INLINE_UPDATE_FRAGMENTS.join('|'), 'i');
const TABLE_BLOCK_REG = /^\|.*?(\\*)\|.*?(\\*)\|/;
const MATH_BLOCK_REG = /^\$\$/;
const CODE_BLOCK_REG = /(^ {0,3}`{3,})([^` ]*)/;
const HTML_BLOCK_REG = /^<([a-zA-Z\d-]+)(?=\s|>)[^<>]*?>$/;
function convertIfNeeded(text, focusOffset) {
    const blockRenderer = this;
    const [match, bulletList, taskList, orderList, atxHeading, setextHeading, blockquote, indentedCodeBlock, thematicBreak] = text.match(INLINE_UPDATE_REG) || [];
    let converted = null;
    switch (true) {
        case (!!thematicBreak && new Set(thematicBreak.split('').filter(i => /\S/.test(i))).size === 1):
            converted = convertToThematicBreak.call(blockRenderer, text, focusOffset);
            break;
        case !!bulletList:
            converted = convertToList.call(blockRenderer, text, focusOffset);
            break;
        case !!orderList:
            converted = convertToList.call(blockRenderer, text, focusOffset);
            break;
        case !!taskList:
            converted = convertToTaskList.call(blockRenderer, text, focusOffset);
            break;
        case !!atxHeading:
            converted = convertToAtxHeading.call(blockRenderer, atxHeading, text, focusOffset);
            break;
        case !!setextHeading:
            converted = convertToSetextHeading.call(blockRenderer, setextHeading, text, focusOffset);
            break;
        case !!blockquote:
            converted = convertToBlockQuote.call(blockRenderer, text, focusOffset);
            break;
        case !!indentedCodeBlock:
            converted = convertToIndentedCodeBlock.call(blockRenderer, text, focusOffset);
            break;
        case !match:
        default:
            converted = convertToParagraph.call(blockRenderer, text, false, focusOffset);
            break;
    }
    return converted;
}
// Thematic Break
function convertToThematicBreak(text, focusOffset) {
    const blockRenderer = this;
    if (blockRenderer.block.type === 'thematic-break') {
        return null;
    }
    const { editable } = blockRenderer.instance.context;
    const { selection } = editable;
    const { focus, focusBlock, isSameBlock } = selection.cursor;
    const hasSelection = (blockRenderer.block === focusBlock && isSameBlock) || typeof focusOffset !== 'undefined';
    const lines = text.split('\n');
    const preParagraphLines = [];
    let thematicLine = '';
    const postParagraphLines = [];
    let thematicLineHasPushed = false;
    for (const l of lines) {
        /* eslint-disable no-useless-escape */
        const THEMATIC_BREAK_REG = / {0,3}(?:\* *\* *\*|- *- *-|_ *_ *_)[ \*\-\_]*$/;
        /* eslint-enable no-useless-escape */
        if (THEMATIC_BREAK_REG.test(l) && !thematicLineHasPushed) {
            thematicLine = l;
            thematicLineHasPushed = true;
        }
        else if (!thematicLineHasPushed) {
            preParagraphLines.push(l);
        }
        else {
            postParagraphLines.push(l);
        }
    }
    const newBlockData = {
        id: generateId(),
        type: "thematic-break",
        text: thematicLine,
    };
    if (preParagraphLines.length) {
        const preParagraphData = {
            id: generateId(),
            type: "paragraph",
            text: preParagraphLines.join('\n')
        };
        blockRenderer.block.insertAdjacent("beforebegin", { data: preParagraphData });
    }
    if (postParagraphLines.length) {
        const postParagraphData = {
            id: generateId(),
            type: "paragraph",
            text: postParagraphLines.join('\n')
        };
        blockRenderer.block.insertAdjacent("afterend", { data: postParagraphData });
    }
    const preParagraphTextLength = preParagraphLines.reduce((acc, i) => acc + i.length + 1, 0); // Add one, because the `\n`
    const offset = typeof focusOffset !== 'undefined' ? Math.min(focusOffset, thematicLine.length) : Math.max(0, focus.offset - preParagraphTextLength);
    return blockRenderer.block.replaceWith({ data: newBlockData, needToFocus: hasSelection, focus: { offset } });
}
function convertToList(text, focusOffset) {
    const blockRenderer = this;
    const { editable } = blockRenderer.instance.context;
    const { selection } = editable;
    const { focusBlock, isSameBlock } = selection.cursor;
    const hasSelection = (blockRenderer.block === focusBlock && isSameBlock) || typeof focusOffset !== 'undefined';
    const matches = text.match(/^([\s\S]*?) {0,3}([*+-]|\d{1,9}(?:\.|\))) {1,4}([\s\S]*)$/);
    if (!matches) {
        return null;
    }
    const { preferLooseListItem } = blockRenderer.instance.options;
    const blockType = /\d/.test(matches[2]) ? 'order-list' : 'bullet-list';
    if (matches[1]) {
        const paragraphData = {
            id: generateId(),
            type: "paragraph",
            text: matches[1].trim()
        };
        blockRenderer.block.insertAdjacent("beforebegin", { data: paragraphData });
    }
    const listData = {
        id: generateId(),
        type: blockType,
        meta: {
            loose: preferLooseListItem
        },
        children: [{
                type: 'list-item',
                id: generateId(),
                children: [{
                        id: generateId(),
                        type: 'paragraph',
                        text: matches[3]
                    }]
            }]
    };
    if (blockType === 'order-list') {
        listData.meta.delimiter = matches[2].slice(-1);
        listData.meta.start = Number(matches[2].slice(0, -1));
    }
    else {
        listData.meta.marker = matches[2];
    }
    const list = blockRenderer.block.replaceWith({ data: listData });
    if (!list) {
        return null;
    }
    const firstContent = list.firstContentInDescendant();
    if (hasSelection) {
        const textLength = firstContent.renderer.text.length;
        const offset = typeof focusOffset !== 'undefined' ? Math.min(focusOffset, textLength) : 0;
        firstContent.renderer.setCursor({ focus: { offset } });
    }
    // convert `[*-+] \[[xX ]\] ` to task list.
    const TASK_LIST_REG = /^\[[x ]\] {1,4}/i;
    if (TASK_LIST_REG.test(firstContent.renderer.text)) {
        convertToTaskList.call(firstContent.renderer, firstContent.renderer.text, focusOffset);
    }
    return list;
}
function convertToTaskList(text, focusOffset) {
    const blockRenderer = this;
    const { editable } = blockRenderer.instance.context;
    const { selection } = editable;
    const { focusBlock, isSameBlock } = selection.cursor;
    const hasSelection = (blockRenderer.block === focusBlock && isSameBlock) || typeof focusOffset !== 'undefined';
    const listItem = blockRenderer.block.parent;
    const list = listItem?.parent;
    const matches = text.match(/^\[([x ]{1})\] {1,4}([\s\S]*)$/i);
    if (!matches || !list || list.type !== 'bullet-list' || !blockRenderer.block.isFirstChild) {
        return null;
    }
    const { preferLooseListItem } = blockRenderer.instance.options;
    const listData = {
        type: 'task-list',
        id: generateId(),
        meta: {
            loose: preferLooseListItem,
            marker: list.renderer.meta.marker
        },
        children: [{
                id: generateId(),
                type: 'task-list-item',
                meta: {
                    checked: matches[1] !== ' '
                },
                children: listItem.children.map(block => {
                    if (block === blockRenderer.block) {
                        return {
                            ...blockRenderer.block.data,
                            type: 'paragraph',
                            text: matches[2]
                        };
                    }
                    else {
                        return block.data;
                    }
                })
            }]
    };
    let newTaskList = null;
    switch (true) {
        case listItem.isOnlyChild:
            newTaskList = list.replaceWith({ data: listData });
            break;
        case listItem.isFirstChild:
            newTaskList = list.insertAdjacent("beforebegin", { data: listData });
            listItem.remove();
            break;
        case listItem.isLastChild:
            newTaskList = list.insertAdjacent("afterend", { data: listData });
            listItem.remove();
            break;
        default: {
            const bulletListData = {
                id: generateId(),
                type: 'bullet-list',
                meta: {
                    // loose: preferLooseListItem,
                    marker: list.renderer.meta.marker
                },
                children: []
            };
            const offset = listItem.index;
            for (let i = offset + 1; i < list.children.length; i++) {
                const block = list.children[i];
                bulletListData.children?.push(block.data);
                block.remove();
            }
            newTaskList = list.insertAdjacent("afterend", { data: listData });
            newTaskList?.insertAdjacent("afterend", { data: bulletListData });
            listItem.remove();
            break;
        }
    }
    if (hasSelection && newTaskList) {
        const firstContent = newTaskList.firstContentInDescendant();
        const textLength = firstContent.renderer.text.length;
        const offset = typeof focusOffset !== 'undefined' ? Math.min(focusOffset, textLength) : 0;
        firstContent.renderer.setCursor({ focus: { offset } });
    }
    return newTaskList;
}
// ATX Heading
function convertToAtxHeading(atxHeading, text, focusOffset) {
    const blockRenderer = this;
    const type = `atx-heading${atxHeading.length}`;
    if (blockRenderer.block.type === type) {
        return null;
    }
    const { editable } = blockRenderer.instance.context;
    const { selection } = editable;
    const { focus, focusBlock, isSameBlock } = selection.cursor;
    const hasSelection = (blockRenderer.block === focusBlock && isSameBlock) || typeof focusOffset !== 'undefined';
    const lines = text.split('\n');
    const preParagraphLines = [];
    let atxLine = '';
    const postParagraphLines = [];
    let atxLineHasPushed = false;
    for (const l of lines) {
        if (/^ {0,3}#{1,6}(?=\s{1,}|$)/.test(l) && !atxLineHasPushed) {
            atxLine = l;
            atxLineHasPushed = true;
        }
        else if (!atxLineHasPushed) {
            preParagraphLines.push(l);
        }
        else {
            postParagraphLines.push(l);
        }
    }
    if (preParagraphLines.length) {
        const preParagraphData = {
            id: generateId(),
            type: "paragraph",
            text: preParagraphLines.join('\n')
        };
        blockRenderer.block.insertAdjacent("beforebegin", { data: preParagraphData });
    }
    if (postParagraphLines.length) {
        const postParagraphData = {
            id: generateId(),
            type: "paragraph",
            text: postParagraphLines.join('\n')
        };
        blockRenderer.block.insertAdjacent("afterend", { data: postParagraphData });
    }
    const newBlockData = {
        id: generateId(),
        type,
        text: atxLine
    };
    const preParagraphTextLength = preParagraphLines.reduce((acc, i) => acc + i.length + 1, 0); // Add one, because the `\n`
    const offset = typeof focusOffset !== 'undefined' ? Math.min(focusOffset, atxLine.length) : Math.max(0, focus.offset - preParagraphTextLength);
    return blockRenderer.block.replaceWith({ data: newBlockData, needToFocus: hasSelection, focus: { offset } });
}
// Setext Heading
function convertToSetextHeading(setextHeading, text, focusOffset) {
    const blockRenderer = this;
    const type = /=/.test(setextHeading) ? 'setext-heading2' : 'setext-heading1';
    if (blockRenderer.block.type === type) {
        return null;
    }
    const { editable } = blockRenderer.instance.context;
    const { selection } = editable;
    const { focusBlock, isSameBlock } = selection.cursor;
    const hasSelection = (blockRenderer.block === focusBlock && isSameBlock) || typeof focusOffset !== 'undefined';
    const lines = text.split('\n');
    const setextLines = [];
    const postParagraphLines = [];
    let setextLineHasPushed = false;
    for (const l of lines) {
        if (/^ {0,3}(?:={3,}|-{3,})(?= {1,}|$)/.test(l) && !setextLineHasPushed) {
            setextLineHasPushed = true;
        }
        else if (!setextLineHasPushed) {
            setextLines.push(l);
        }
        else {
            postParagraphLines.push(l);
        }
    }
    const newBlockData = {
        id: generateId(),
        type,
        meta: {
            underline: setextHeading
        },
        text: setextLines.join('\n')
    };
    if (postParagraphLines.length) {
        const postParagraphData = {
            id: generateId(),
            type: "paragraph",
            text: postParagraphLines.join('\n')
        };
        blockRenderer.block.insertAdjacent("afterend", { data: postParagraphData });
    }
    const textLength = newBlockData.text?.length || 0;
    const offset = typeof focusOffset !== 'undefined' ? Math.min(focusOffset, textLength) : textLength;
    return blockRenderer.block.replaceWith({ data: newBlockData, needToFocus: hasSelection, focus: { offset } });
}
// Block Quote
function convertToBlockQuote(text, focusOffset) {
    const blockRenderer = this;
    const { editable } = blockRenderer.instance.context;
    const { selection } = editable;
    const { focus, focusBlock, isSameBlock } = selection.cursor;
    const hasSelection = (blockRenderer.block === focusBlock && isSameBlock) || typeof focusOffset !== 'undefined';
    const lines = text.split('\n');
    const preParagraphLines = [];
    const quoteLines = [];
    let quoteLinesHasPushed = false;
    let delta = 0;
    for (const l of lines) {
        if (/^ {0,3}>/.test(l) && !quoteLinesHasPushed) {
            quoteLinesHasPushed = true;
            const tokens = /( *> *)(.*)/.exec(l);
            if (tokens) {
                delta = tokens[1].length;
                quoteLines.push(tokens[2]);
            }
        }
        else if (!quoteLinesHasPushed) {
            preParagraphLines.push(l);
        }
        else {
            quoteLines.push(l);
        }
    }
    let quoteParagraphData = {
        id: generateId(),
        type: blockRenderer.block.type,
        meta: blockRenderer.meta,
        text: quoteLines.join('\n')
    };
    const newBlockData = {
        id: generateId(),
        type: 'block-quote',
        children: [quoteParagraphData]
    };
    if (preParagraphLines.length) {
        const preParagraphData = {
            id: generateId(),
            type: "paragraph",
            text: preParagraphLines.join('\n')
        };
        blockRenderer.block.insertAdjacent("beforebegin", { data: preParagraphData });
    }
    const quoteBlock = blockRenderer.block.replaceWith({ data: newBlockData });
    if (hasSelection) {
        const cursorBlock = quoteBlock?.firstContentInDescendant();
        let offset = Math.max(0, focus.offset - delta);
        offset = typeof focusOffset !== undefined ? Math.min(focusOffset, cursorBlock.renderer.text.length) : offset;
        cursorBlock?.renderer.setCursor({ focus: { offset } });
    }
    return quoteBlock;
}
// Indented Code Block
function convertToIndentedCodeBlock(text, focusOffset) {
    const blockRenderer = this;
    const { editable } = blockRenderer.instance.context;
    const { selection } = editable;
    const { focusBlock, isSameBlock } = selection.cursor;
    const hasSelection = (blockRenderer.block === focusBlock && isSameBlock) || typeof focusOffset !== 'undefined';
    const lines = text.split('\n');
    const codeLines = [];
    const paragraphLines = [];
    let canBeCodeLine = true;
    for (const l of lines) {
        if (/^ {4,}/.test(l) && canBeCodeLine) {
            codeLines.push(l.replace(/^ {4}/, ''));
        }
        else {
            canBeCodeLine = false;
            paragraphLines.push(l);
        }
    }
    if (paragraphLines.length) {
        const postParagraphData = {
            id: generateId(),
            type: "paragraph",
            text: paragraphLines.join('\n')
        };
        blockRenderer.block.insertAdjacent("afterend", { data: postParagraphData });
    }
    const codeData = {
        id: generateId(),
        type: 'code-block',
        meta: {
            type: 'indented'
        },
        children: [
            {
                id: generateId(),
                type: 'language',
                text: ''
            },
            {
                id: generateId(),
                type: 'code',
                meta: {
                    lang: '',
                },
                text: codeLines.join('\n')
            }
        ]
    };
    const codeBlock = blockRenderer.block.replaceWith({ data: codeData });
    if (hasSelection && codeBlock) {
        const cursorBlock = codeBlock.lastContentInDescendant();
        const textLength = cursorBlock?.renderer.text.length || 0;
        const offset = typeof focusOffset !== 'undefined' ? Math.min(focusOffset, textLength) : 0;
        cursorBlock?.renderer.setCursor({ focus: { offset } });
    }
    return codeBlock;
}
// Paragraph
function convertToParagraph(text, force = false, focusOffset) {
    const blockRenderer = this;
    if (!force &&
        (blockRenderer.block.type === 'setext-heading1' ||
            blockRenderer.block.type === 'setext-heading2' ||
            blockRenderer.block.type === 'paragraph')) {
        return null;
    }
    const { editable } = blockRenderer.instance.context;
    const { selection } = editable;
    const { focus, focusBlock, isSameBlock } = selection.cursor;
    const hasSelection = (blockRenderer.block === focusBlock && isSameBlock) || typeof focusOffset !== 'undefined';
    const newBlockData = {
        id: generateId(),
        type: 'paragraph',
        text
    };
    focus.offset = typeof focusOffset !== 'undefined' ? Math.min(focusOffset, text.length) : focus.offset;
    return blockRenderer.block.replaceWith({ data: newBlockData, needToFocus: hasSelection, focus });
}

export { CODE_BLOCK_REG, HTML_BLOCK_REG, INLINE_UPDATE_REG, MATH_BLOCK_REG, TABLE_BLOCK_REG, convertIfNeeded };
