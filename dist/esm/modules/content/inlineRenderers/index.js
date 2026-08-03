/*!
 * meditable v0.2.1
 * Github: https://github.com/geekeditor/meditable
 * (c) 2023-2026 montisan <imontisan@gmail.com>
 * Released under the MIT License.
 */
import MENode from './nodes/node.js';
import MEStrong from './nodes/strong.js';
import MEEm from './nodes/em.js';
import MEHeader from './nodes/header.js';
import MEHr from './nodes/hr.js';
import MECodeFense from './nodes/codeFense.js';
import MEDel from './nodes/del.js';
import MESoftLineBreak from './nodes/softLineBreak.js';
import MEHardLineBreak from './nodes/hardLineBreak.js';
import MESubScript from './nodes/subScript.js';
import MESuperScript from './nodes/superScript.js';
import MEHtmlTag from './nodes/htmlTag.js';
import MEHtmlBr from './nodes/htmlBr.js';
import MEHtmlValidTag from './nodes/htmlValidTag.js';
import MEHtmlRuby from './nodes/htmlRuby.js';
import MEHtmlEscape from './nodes/htmlEscape.js';
import MEEmoji from './nodes/emoji.js';
import MEEmojiValid from './nodes/emojiValid.js';
import MEInlineCode from './nodes/inlineCode.js';
import METailHeader from './nodes/tailHeader.js';
import MEAutoLink from './nodes/autoLink.js';
import MEAutoLinkExtension from './nodes/autoLinkExtension.js';
import MEBacklash from './nodes/backlash.js';
import MELink from './nodes/link.js';
import MELinkNoText from './nodes/linkNoText.js';
import MEHtmlComment from './nodes/htmlComment.js';
import MEFootnoteIdentifier from './nodes/footnoteIdentifier.js';
import MEReferenceDefinition from './nodes/referenceDefinition.js';
import MEReferenceLink from './nodes/referenceLink.js';
import MEReferenceImage from './nodes/referenceImage.js';
import MEHtmlImg from './nodes/htmlImg.js';
import MEImage from './nodes/image.js';
import MEInlineMath from './nodes/inlineMath.js';
import MEMultipleMath from './nodes/multipleMath.js';
import MEEntityReference from './nodes/entityReference.js';

MENode.register(MEStrong);
MENode.register(MEEm);
MENode.register(MEHeader);
MENode.register(METailHeader);
MENode.register(MEHr);
MENode.register(MECodeFense);
MENode.register(MEDel);
MENode.register(MESoftLineBreak);
MENode.register(MEHardLineBreak);
MENode.register(MESubScript);
MENode.register(MESuperScript);
MENode.register(MEHtmlTag);
MENode.register(MEHtmlBr);
MENode.register(MEHtmlValidTag);
MENode.register(MEHtmlComment);
MENode.register(MEHtmlRuby);
MENode.register(MEHtmlEscape);
MENode.register(MEEmoji);
MENode.register(MEEmojiValid);
MENode.register(MEInlineCode);
MENode.register(MEAutoLink);
MENode.register(MEAutoLinkExtension);
MENode.register(MELink);
MENode.register(MELinkNoText);
MENode.register(MEBacklash);
MENode.register(MEFootnoteIdentifier);
MENode.register(MEReferenceDefinition);
MENode.register(MEReferenceLink);
MENode.register(MEReferenceImage);
MENode.register(MEHtmlImg);
MENode.register(MEImage);
MENode.register(MEInlineMath);
MENode.register(MEMultipleMath);
MENode.register(MEEntityReference);
function createNode(instance, type) {
    const Constructable = MENode.nodes[type] || MENode;
    return new Constructable(instance);
}
async function nodeStaticRender(type, { innerHTML, data, labels }) {
    const Constructable = MENode.nodes[type] || MENode;
    return Constructable.staticRender({ innerHTML, data, labels });
}
/*
export function render(el: HTMLElement, hasBeginRules?: boolean) {
    const text = el['BLOCK_RENDERER_INSTANCE'].text || getTextContent(el, [CLASS_NAMES.ME_INLINE_RENDER, CLASS_NAMES.ME_INLINE_RENDER]);
    const tokens = tokenizer(text, { hasBeginRules })

}
*/

export { createNode, nodeStaticRender };
