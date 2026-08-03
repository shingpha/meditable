/*!
 * meditable v0.2.1
 * Github: https://github.com/geekeditor/meditable
 * (c) 2023-2026 montisan <imontisan@gmail.com>
 * Released under the MIT License.
 */
'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var renderer = require('../../renderer.js');
var utils = require('../../../../../utils/utils.js');

class METableTheadRenderer extends renderer.default {
    static type = "table-thead";
    static tagName = 'thead';
    get anchor() {
        return this.block.parent;
    }
}
class METableTbodyRenderer extends renderer.default {
    static type = "table-tbody";
    static tagName = 'tbody';
    get anchor() {
        return this.block.parent;
    }
}
class METableTrRenderer extends renderer.default {
    static type = "table-tr";
    static tagName = 'tr';
    get isEmpty() {
        const state = this.block.data;
        return state.children.every(cell => cell.text === '');
    }
    get anchor() {
        return this.block.parent.parent;
    }
}
class METableRenderer extends renderer.default {
    static type = "table";
    static tagName = 'table';
    static async staticRender({ innerHTML }) {
        return `<figure class="table-block"><${this.tagName} class="${[this.type, this.customClassName].filter(Boolean).join(' ')}">${innerHTML || ''}</${this.tagName}></figure>`;
    }
    updateContent(checkUpdate) {
        if (!this.nodes.el) {
            this.nodes.el = this.make('figure');
            this.nodes.holder = this.make('table');
            this.nodes.el.appendChild(this.nodes.holder);
        }
        return true;
    }
    get isEmpty() {
        const state = this.block.data;
        return state.children.every((section) => section.children.every(row => row.children.every(cell => cell.text === '')));
    }
    get rowCount() {
        return this.block.firstChild.children.length + this.block.lastChild.children.length;
    }
    get columnCount() {
        return this.block.firstChild.firstChild.children.length;
    }
    get body() {
        return this.block.lastChild;
    }
    get head() {
        return this.block.firstChild;
    }
    empty() {
        const { isEmpty } = this;
        if (isEmpty) {
            return;
        }
        const table = this.block;
        table.children.forEach(section => {
            section.children.forEach(row => {
                row.children.forEach(cell => {
                    cell.renderer.render({ text: "" });
                });
            });
        });
    }
    insertRow(offset) {
        const { columnCount } = this;
        const firstRowState = this.head.children[0].data;
        const rowData = {
            id: utils.generateId(),
            type: 'table-tr',
            children: [...new Array(columnCount)].map((_, i) => {
                return {
                    id: utils.generateId(),
                    type: 'table-td',
                    meta: {
                        align: firstRowState.children[i].meta.align
                    },
                    text: ''
                };
            })
        };
        const rowBlock = this.body.insert({ data: rowData, index: offset });
        return rowBlock.firstContentInDescendant();
    }
    insertColumn(offset, align = 'none') {
        const cells = [];
        this.head.children.forEach(row => {
            const cellData = {
                id: utils.generateId(),
                type: 'table-th',
                meta: { align },
                text: ''
            };
            const cell = row.insert({ data: cellData, index: offset });
            cells.push(cell);
        });
        this.body.children.forEach(row => {
            const cellData = {
                id: utils.generateId(),
                type: 'table-td',
                meta: { align },
                text: ''
            };
            const cell = row.insert({ data: cellData, index: offset });
            cells.push(cell);
        });
        return cells;
    }
    removeRow(offset) {
        const row = this.body.children[offset];
        row?.remove();
    }
    removeColumn(offset) {
        const { columnCount } = this;
        if (offset < 0 || offset >= columnCount) {
            return;
        }
        if (this.columnCount === 1) {
            return this.block.remove();
        }
        this.head.children.forEach(row => {
            const cell = row.children[offset];
            cell?.remove();
        });
        this.body.children.forEach(row => {
            const cell = row.children[offset];
            cell?.remove();
        });
    }
    alignColumn(offset, value) {
        const { columnCount } = this;
        if (offset < 0 || offset >= columnCount) {
            return;
        }
        this.head.children.forEach(row => {
            const cell = row.children[offset];
            if (cell) {
                let renderer = cell.renderer;
                const { align: oldValue } = renderer;
                renderer.align = oldValue === value ? 'none' : value;
            }
        });
        this.body.children.forEach(row => {
            const cell = row.children[offset];
            if (cell) {
                let renderer = cell.renderer;
                const { align: oldValue } = renderer;
                renderer.align = oldValue === value ? 'none' : value;
            }
        });
    }
}

exports.METableTbodyRenderer = METableTbodyRenderer;
exports.METableTheadRenderer = METableTheadRenderer;
exports.METableTrRenderer = METableTrRenderer;
exports.default = METableRenderer;
