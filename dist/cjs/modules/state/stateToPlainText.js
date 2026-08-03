/*!
 * meditable v0.2.1
 * Github: https://github.com/geekeditor/meditable
 * (c) 2023-2026 montisan <imontisan@gmail.com>
 * Released under the MIT License.
 */
'use strict';

var index = require('../content/inlineRenderers/tokenizer/index.js');
var utils = require('./utils.js');

class StateToPlainText {
    labels;
    generate(states, asFile) {
        this.labels = utils.collectReferenceDefinitions(states);
        const plainText = this.convertStatesToPlainText(states);
        return plainText;
    }
    convertStatesToPlainText(states) {
        const result = [];
        for (const state of states) {
            const plainText = /(code|html-block|math-block|diagram-block|language)$/.test(state.type) ? state.text || '' : (state.children && state.children.length) ? this.convertStatesToPlainText(state.children) : this.stateToPlainText(state);
            result.push(plainText);
        }
        return result.join("\n");
    }
    stateToPlainText(state) {
        if (!state.text) {
            return '';
        }
        const { labels } = this;
        const hasBeginRules = /thematicbreak|paragraph|atxheading/.test(state.type);
        const tokens = index.tokenizer(state.text, { hasBeginRules, labels });
        return this.tokensToPlainText(tokens);
    }
    tokensToPlainText(tokens) {
        const result = [];
        for (const token of tokens) {
            const plainText = (token.children && token.children.length) ? this.tokensToPlainText(token.children) : token.content || "";
            result.push(plainText);
        }
        return result.join("");
    }
}

module.exports = StateToPlainText;
