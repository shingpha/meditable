/*!
 * meditable v0.2.1
 * Github: https://github.com/geekeditor/meditable
 * (c) 2023-2026 montisan <imontisan@gmail.com>
 * Released under the MIT License.
 */
'use strict';

var dom = require('./dom.js');
var classNames = require('../../../utils/classNames.js');
var domUtils = require('../../../utils/domUtils.js');

function findBlockByElement(el) {
    if (!domUtils.isElement(el)) {
        el = el.parentNode;
    }
    if (!el) {
        return null;
    }
    const blockEl = el.closest(`.${classNames.CLASS_NAMES.ME_BLOCK}`);
    const find = blockEl && blockEl['BLOCK_INSTANCE'];
    return find;
}
function findDropBlock(block) {
    const target = block.nodes.el.querySelector(`.${classNames.CLASS_NAMES.ME_BLOCK__DROP_TARGET}`);
    if (target) {
        return target['BLOCK_INSTANCE'];
    }
    return;
}
function clearDropBlock(block) {
    block.dropTarget = false;
    if (!block.children) {
        return;
    }
    block.children.forEach((child) => clearDropBlock(child));
}
const findInlineNode = (node) => {
    if (node.nodeType === 3) {
        node = node.parentNode;
    }
    if (!node)
        return null;
    let target = null;
    while ((node = node.closest(`.${classNames.CLASS_NAMES.ME_NODE}`))) {
        target = node;
        node = node.parentNode;
    }
    return target;
};
const findActivedNodes = (node, offset) => {
    const activedNodes = [];
    const target = findInlineNode(node);
    if (target) {
        const tOffset = dom.getOffsetOfParent(node, target) + offset;
        const text = dom.getTextContent(target, [classNames.CLASS_NAMES.ME_INLINE_RENDER]);
        // console.log(node, focusNode, offset, text, text.length);
        activedNodes.push(target);
        if (tOffset === 0 && target.previousElementSibling) {
            activedNodes.push(target.previousElementSibling);
        }
        if (tOffset === text.length && target.nextElementSibling) {
            activedNodes.push(target.nextElementSibling);
        }
    }
    return activedNodes;
};

exports.clearDropBlock = clearDropBlock;
exports.findActivedNodes = findActivedNodes;
exports.findBlockByElement = findBlockByElement;
exports.findDropBlock = findDropBlock;
exports.findInlineNode = findInlineNode;
