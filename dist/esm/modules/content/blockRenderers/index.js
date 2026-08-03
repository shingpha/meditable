/*!
 * meditable v0.2.1
 * Github: https://github.com/geekeditor/meditable
 * (c) 2023-2026 montisan <imontisan@gmail.com>
 * Released under the MIT License.
 */
import MEBlockRenderer from './renderer.js';
import MEDocumentRenderer from './document.js';
import MEParagraphRenderer from './commonMark/paragraph/index.js';
import { MEAtxHeading1Renderer, MEAtxHeading2Renderer, MEAtxHeading3Renderer, MEAtxHeading4Renderer, MEAtxHeading5Renderer, MEAtxHeading6Renderer } from './commonMark/atxHeading.js';
import { MESetextHeading1Renderer, MESetextHeading2Renderer } from './commonMark/setextHeading.js';
import MEBlockQuoteRenderer from './commonMark/blockQuote.js';
import MEBulletListRenderer from './commonMark/bulletList.js';
import MEOrderListRenderer from './commonMark/orderList.js';
import MEListItemRenderer from './commonMark/listItem.js';
import METhematicBreakRenderer from './commonMark/thematicBreak.js';
import MELanguageRenderer from './commonMark/codeBlock/language.js';
import MECodeRenderer from './commonMark/codeBlock/code.js';
import MECodeBlockRenderer from './commonMark/codeBlock/index.js';
import MEHtmlBlockRenderer from './commonMark/htmlBlock.js';
import MEMathBlockRenderer from './extra/mathBlock.js';
import MEDiagramBlockRenderer from './extra/diagramBlock.js';
import METaskListRenderer from './gfm/taskList/index.js';
import METaskListItemRenderer from './gfm/taskList/item.js';
import METableRenderer, { METableTheadRenderer, METableTbodyRenderer, METableTrRenderer } from './gfm/table/index.js';
import METableTdRenderer from './gfm/table/td.js';
import METableThRenderer from './gfm/table/th.js';
import MEFrontmatterRenderer from './extra/frontmatter.js';

MEBlockRenderer.register(MEDocumentRenderer);
MEBlockRenderer.register(MEParagraphRenderer);
MEBlockRenderer.register(MEAtxHeading1Renderer);
MEBlockRenderer.register(MEAtxHeading2Renderer);
MEBlockRenderer.register(MEAtxHeading3Renderer);
MEBlockRenderer.register(MEAtxHeading4Renderer);
MEBlockRenderer.register(MEAtxHeading5Renderer);
MEBlockRenderer.register(MEAtxHeading6Renderer);
MEBlockRenderer.register(MESetextHeading1Renderer);
MEBlockRenderer.register(MESetextHeading2Renderer);
MEBlockRenderer.register(MEBlockQuoteRenderer);
MEBlockRenderer.register(MEBulletListRenderer);
MEBlockRenderer.register(MEOrderListRenderer);
MEBlockRenderer.register(MEListItemRenderer);
MEBlockRenderer.register(METhematicBreakRenderer);
MEBlockRenderer.register(MELanguageRenderer);
MEBlockRenderer.register(MECodeRenderer);
MEBlockRenderer.register(MECodeBlockRenderer);
MEBlockRenderer.register(MEHtmlBlockRenderer);
MEBlockRenderer.register(MEMathBlockRenderer);
MEBlockRenderer.register(MEDiagramBlockRenderer);
MEBlockRenderer.register(METaskListRenderer);
MEBlockRenderer.register(METaskListItemRenderer);
MEBlockRenderer.register(METableRenderer);
MEBlockRenderer.register(METableTheadRenderer);
MEBlockRenderer.register(METableTbodyRenderer);
MEBlockRenderer.register(METableTrRenderer);
MEBlockRenderer.register(METableTdRenderer);
MEBlockRenderer.register(METableThRenderer);
MEBlockRenderer.register(MEFrontmatterRenderer);
function createRenderer(instance, type) {
    const Constructable = MEBlockRenderer.renders[type] || MEBlockRenderer;
    return new Constructable(instance);
}
async function blockStaticRender(type, options) {
    const Constructable = MEBlockRenderer.renders[type] || MEBlockRenderer;
    return Constructable.staticRender(options);
}

export { blockStaticRender, createRenderer };
