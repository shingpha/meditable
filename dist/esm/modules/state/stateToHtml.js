/*!
 * meditable v0.2.1
 * Github: https://github.com/geekeditor/meditable
 * (c) 2023-2026 montisan <imontisan@gmail.com>
 * Released under the MIT License.
 */
import { tokenizer } from '../content/inlineRenderers/tokenizer/index.js';
import { collectReferenceDefinitions } from './utils.js';
import { blockStaticRender } from '../content/blockRenderers/index.js';
import { nodeStaticRender } from '../content/inlineRenderers/index.js';

class StateToHtml {
    diagramHtmlType = 'svg';
    staticNodeHtmlRenderer;
    staticBlockHtmlRenderer;
    labels;
    constructor(options) {
        if (options) {
            this.diagramHtmlType = options.diagramHtmlType || 'svg';
            this.staticNodeHtmlRenderer = options.staticNodeHtmlRenderer;
            this.staticBlockHtmlRenderer = options.staticBlockHtmlRenderer;
        }
    }
    async generate(states, asFile) {
        this.labels = collectReferenceDefinitions(states);
        const html = await this.convertStatesToHtml(states);
        return html;
    }
    async convertStatesToHtml(states) {
        const result = [];
        for (const state of states) {
            const innerHTML = /(code|html-block|math-block|diagram-block|language)$/.test(state.type) ? '' : (state.children && state.children.length) ? await this.convertStatesToHtml(state.children) : await this.stateToHtml(state);
            let diagramHtmlType = 'svg';
            if (/diagram-block/.test(state.type)) {
                if (typeof this.diagramHtmlType === 'string') {
                    diagramHtmlType = this.diagramHtmlType;
                }
                else if (this.diagramHtmlType && this.diagramHtmlType[state.meta.type]) {
                    diagramHtmlType = this.diagramHtmlType[state.meta.type];
                }
            }
            let html = await blockStaticRender(state.type, { innerHTML, diagramHtmlType, data: state });
            if (this.staticBlockHtmlRenderer) {
                html = await this.staticBlockHtmlRenderer({ innerHTML, diagramHtmlType, data: state }, html);
            }
            result.push(html);
        }
        return result.join("");
    }
    async stateToHtml(state) {
        if (!state.text) {
            return '';
        }
        const { labels } = this;
        const hasBeginRules = /thematic-break|paragraph|atx-heading/.test(state.type);
        const tokens = tokenizer(state.text, { hasBeginRules, labels });
        return this.tokensToHtml(tokens);
    }
    async tokensToHtml(tokens) {
        const { labels } = this;
        const result = [];
        for (const token of tokens) {
            const innerHTML = (token.children && token.children.length) ? await this.tokensToHtml(token.children) : token.content || "";
            let html = await nodeStaticRender(token.type, { innerHTML, data: token, labels });
            if (this.staticNodeHtmlRenderer) {
                html = await this.staticNodeHtmlRenderer({ innerHTML, data: token, labels }, html);
            }
            result.push(html);
        }
        return result.join("");
    }
}

export { StateToHtml as default };
