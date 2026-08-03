/*!
 * meditable v0.2.1
 * Github: https://github.com/geekeditor/meditable
 * (c) 2023-2026 montisan <imontisan@gmail.com>
 * Released under the MIT License.
 */
'use strict';

var renderer = require('./renderer.js');
var document = require('./document.js');
var index = require('./commonMark/paragraph/index.js');
var atxHeading = require('./commonMark/atxHeading.js');
var setextHeading = require('./commonMark/setextHeading.js');
var blockQuote = require('./commonMark/blockQuote.js');
var bulletList = require('./commonMark/bulletList.js');
var orderList = require('./commonMark/orderList.js');
var listItem = require('./commonMark/listItem.js');
var thematicBreak = require('./commonMark/thematicBreak.js');
var language = require('./commonMark/codeBlock/language.js');
var code = require('./commonMark/codeBlock/code.js');
var index$1 = require('./commonMark/codeBlock/index.js');
var htmlBlock = require('./commonMark/htmlBlock.js');
var mathBlock = require('./extra/mathBlock.js');
var diagramBlock = require('./extra/diagramBlock.js');
var index$2 = require('./gfm/taskList/index.js');
var item = require('./gfm/taskList/item.js');
var index$3 = require('./gfm/table/index.js');
var td = require('./gfm/table/td.js');
var th = require('./gfm/table/th.js');
var frontmatter = require('./extra/frontmatter.js');

renderer.default.register(document);
renderer.default.register(index);
renderer.default.register(atxHeading.MEAtxHeading1Renderer);
renderer.default.register(atxHeading.MEAtxHeading2Renderer);
renderer.default.register(atxHeading.MEAtxHeading3Renderer);
renderer.default.register(atxHeading.MEAtxHeading4Renderer);
renderer.default.register(atxHeading.MEAtxHeading5Renderer);
renderer.default.register(atxHeading.MEAtxHeading6Renderer);
renderer.default.register(setextHeading.MESetextHeading1Renderer);
renderer.default.register(setextHeading.MESetextHeading2Renderer);
renderer.default.register(blockQuote);
renderer.default.register(bulletList);
renderer.default.register(orderList);
renderer.default.register(listItem);
renderer.default.register(thematicBreak);
renderer.default.register(language);
renderer.default.register(code);
renderer.default.register(index$1);
renderer.default.register(htmlBlock);
renderer.default.register(mathBlock);
renderer.default.register(diagramBlock);
renderer.default.register(index$2);
renderer.default.register(item);
renderer.default.register(index$3.default);
renderer.default.register(index$3.METableTheadRenderer);
renderer.default.register(index$3.METableTbodyRenderer);
renderer.default.register(index$3.METableTrRenderer);
renderer.default.register(td);
renderer.default.register(th);
renderer.default.register(frontmatter);
function createRenderer(instance, type) {
    const Constructable = renderer.default.renders[type] || renderer.default;
    return new Constructable(instance);
}
async function blockStaticRender(type, options) {
    const Constructable = renderer.default.renders[type] || renderer.default;
    return Constructable.staticRender(options);
}

exports.blockStaticRender = blockStaticRender;
exports.createRenderer = createRenderer;
