/*!
 * meditable v0.2.1
 * Github: https://github.com/geekeditor/meditable
 * (c) 2023-2026 montisan <imontisan@gmail.com>
 * Released under the MIT License.
 */
'use strict';

var module$1 = require('../module.js');
var markdownToState = require('./markdownToState.js');
var stateToMarkdown = require('./stateToMarkdown.js');
var htmlToMarkdown = require('./htmlToMarkdown.js');
var stateToHtml = require('./stateToHtml.js');
var stateToPlainText = require('./stateToPlainText.js');
var utils = require('./utils.js');

class MEState extends module$1 {
    markdownToState;
    stateToMarkdown;
    htmlToMarkdown;
    stateToHtml;
    stateToPlainText;
    state;
    labels;
    constructor(instance) {
        super(instance);
        this.markdownToState = new markdownToState();
        this.stateToMarkdown = new stateToMarkdown();
        this.htmlToMarkdown = new htmlToMarkdown();
        this.stateToHtml = new stateToHtml({ diagramHtmlType: instance.options.diagramHtmlType, staticNodeHtmlRenderer: instance.options.staticNodeHtmlRenderer, staticBlockHtmlRenderer: instance.options.staticBlockHtmlRenderer });
        this.stateToPlainText = new stateToPlainText();
    }
    async prepare() {
        return true;
    }
    setContent(text, type = "md") {
        if (type === 'html') {
            text = this.htmlToMarkdown.generate(text);
        }
        const { content, stack, event } = this.instance.context;
        const data = this.markdownToState.generate(text);
        this.labels = utils.collectReferenceDefinitions(data.children);
        content.render({ data });
        content.setDefaultCursor();
        stack.reset();
        requestAnimationFrame(() => {
            const currentScene = this.getScene();
            event.trigger("aftersetcontent", currentScene);
        });
    }
    async getContent(type = "md") {
        const { content } = this.instance.context;
        const data = content.data;
        if (type === 'text') {
            const text = this.stateToPlainText.generate(data.children || []);
            return text;
        }
        else if (type === 'html') {
            const html = await this.stateToHtml.generate(data.children || []);
            return html;
        }
        else {
            const markdown = this.stateToMarkdown.generate(data.children || []);
            return markdown;
        }
    }
    getWordCount() {
        const { content } = this.instance.context;
        const data = content.data;
        const text = this.stateToPlainText.generate(data.children || []);
        const pattern = /[a-zA-Z0-9_\u0392-\u03c9]+|[\u4E00-\u9FFF\u3400-\u4dbf\uf900-\ufaff\u3040-\u309f\uac00-\ud7af]+/g;
        const match = text.match(pattern);
        let count = 0;
        if (match == null) {
            return count;
        }
        for (var i = 0; i < match.length; i++) {
            if (match[i].charCodeAt(0) >= 0x4E00) {
                count += match[i].length;
            }
            else {
                count += 1;
            }
        }
        return count;
    }
    getScene() {
        const { content, editable } = this.instance.context;
        const { anchorBlock, focusBlock, ...cursor } = editable.selection.cursor;
        const state = content.data;
        return {
            state,
            cursor
        };
    }
    setScene({ state, cursor }) {
        try {
            const data = state;
            this.labels = utils.collectReferenceDefinitions(data.children);
            const { content, editable } = this.instance.context;
            content.render({ data, cursor });
            editable.selection.setCursor(cursor);
        }
        catch (error) {
        }
    }
}

module.exports = MEState;
