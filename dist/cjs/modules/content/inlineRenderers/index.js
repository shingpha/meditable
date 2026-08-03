/*!
 * meditable v0.2.1
 * Github: https://github.com/geekeditor/meditable
 * (c) 2023-2026 montisan <imontisan@gmail.com>
 * Released under the MIT License.
 */
'use strict';

var node = require('./nodes/node.js');
var strong = require('./nodes/strong.js');
var em = require('./nodes/em.js');
var header = require('./nodes/header.js');
var hr = require('./nodes/hr.js');
var codeFense = require('./nodes/codeFense.js');
var del = require('./nodes/del.js');
var softLineBreak = require('./nodes/softLineBreak.js');
var hardLineBreak = require('./nodes/hardLineBreak.js');
var subScript = require('./nodes/subScript.js');
var superScript = require('./nodes/superScript.js');
var htmlTag = require('./nodes/htmlTag.js');
var htmlBr = require('./nodes/htmlBr.js');
var htmlValidTag = require('./nodes/htmlValidTag.js');
var htmlRuby = require('./nodes/htmlRuby.js');
var htmlEscape = require('./nodes/htmlEscape.js');
var emoji = require('./nodes/emoji.js');
var emojiValid = require('./nodes/emojiValid.js');
var inlineCode = require('./nodes/inlineCode.js');
var tailHeader = require('./nodes/tailHeader.js');
var autoLink = require('./nodes/autoLink.js');
var autoLinkExtension = require('./nodes/autoLinkExtension.js');
var backlash = require('./nodes/backlash.js');
var link = require('./nodes/link.js');
var linkNoText = require('./nodes/linkNoText.js');
var htmlComment = require('./nodes/htmlComment.js');
var footnoteIdentifier = require('./nodes/footnoteIdentifier.js');
var referenceDefinition = require('./nodes/referenceDefinition.js');
var referenceLink = require('./nodes/referenceLink.js');
var referenceImage = require('./nodes/referenceImage.js');
var htmlImg = require('./nodes/htmlImg.js');
var image = require('./nodes/image.js');
var inlineMath = require('./nodes/inlineMath.js');
var multipleMath = require('./nodes/multipleMath.js');
var entityReference = require('./nodes/entityReference.js');

node.register(strong);
node.register(em);
node.register(header);
node.register(tailHeader);
node.register(hr);
node.register(codeFense);
node.register(del);
node.register(softLineBreak);
node.register(hardLineBreak);
node.register(subScript);
node.register(superScript);
node.register(htmlTag);
node.register(htmlBr);
node.register(htmlValidTag);
node.register(htmlComment);
node.register(htmlRuby);
node.register(htmlEscape);
node.register(emoji);
node.register(emojiValid);
node.register(inlineCode);
node.register(autoLink);
node.register(autoLinkExtension);
node.register(link);
node.register(linkNoText);
node.register(backlash);
node.register(footnoteIdentifier);
node.register(referenceDefinition);
node.register(referenceLink);
node.register(referenceImage);
node.register(htmlImg);
node.register(image);
node.register(inlineMath);
node.register(multipleMath);
node.register(entityReference);
function createNode(instance, type) {
    const Constructable = node.nodes[type] || node;
    return new Constructable(instance);
}
async function nodeStaticRender(type, { innerHTML, data, labels }) {
    const Constructable = node.nodes[type] || node;
    return Constructable.staticRender({ innerHTML, data, labels });
}
/*
export function render(el: HTMLElement, hasBeginRules?: boolean) {
    const text = el['BLOCK_RENDERER_INSTANCE'].text || getTextContent(el, [CLASS_NAMES.ME_INLINE_RENDER, CLASS_NAMES.ME_INLINE_RENDER]);
    const tokens = tokenizer(text, { hasBeginRules })

}
*/

exports.createNode = createNode;
exports.nodeStaticRender = nodeStaticRender;
