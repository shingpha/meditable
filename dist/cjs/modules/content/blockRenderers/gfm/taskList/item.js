/*!
 * meditable v0.2.1
 * Github: https://github.com/geekeditor/meditable
 * (c) 2023-2026 montisan <imontisan@gmail.com>
 * Released under the MIT License.
 */
'use strict';

var renderer = require('../../renderer.js');
var classNames = require('../../../../../utils/classNames.js');

class METaskListItemRenderer extends renderer.default {
    static type = "task-list-item";
    static async staticRender({ data, innerHTML }) {
        const checked = !!data.meta.checked;
        const checkBoxClassName = `${this.type}-checkbox`;
        const contentClassName = `${this.type}-content`;
        const checkBoxCheckedClassName = `${this.type}-checkbox--checked`;
        const classNames = [checkBoxClassName];
        if (checked) {
            classNames.push(checkBoxCheckedClassName);
        }
        return `<${this.tagName} class="${this.type}"><span class="${classNames.join(" ")}"></span><${this.tagName} class="${contentClassName}">${innerHTML || ''}</${this.tagName}></${this.tagName}>`;
    }
    get checkbox() {
        return this.nodes.el.firstElementChild;
    }
    updateContent(checkUpdate) {
        if (!this.nodes.el) {
            this.nodes.el = this.make(this.tagName);
            this.nodes.el.appendChild(this.make('span', [classNames.CLASS_NAMES.ME_TASK_LIST_ITEM_CHECKBOX], {
                spellcheck: 'false',
                contenteditable: 'false'
            }));
            this.nodes.holder = this.make(this.tagName, [classNames.CLASS_NAMES.ME_TASK_LIST_ITEM_CONTENT]);
            this.nodes.el.appendChild(this.nodes.holder);
            this.mutableListeners.on(this.checkbox, 'click', this.clickCheckboxHandler.bind(this));
        }
        this.checkbox.classList.toggle(classNames.CLASS_NAMES.ME_TASK_LIST_ITEM_CHECKBOX__CHECKED, !!this.meta.checked);
        return true;
    }
    clickCheckboxHandler(event) {
        event.preventDefault();
        this.meta.checked = !this.meta.checked;
        this.checkbox.classList.toggle(classNames.CLASS_NAMES.ME_TASK_LIST_ITEM_CHECKBOX__CHECKED, !!this.meta.checked);
    }
}

module.exports = METaskListItemRenderer;
