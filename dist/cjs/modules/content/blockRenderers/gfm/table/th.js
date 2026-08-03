/*!
 * meditable v0.2.1
 * Github: https://github.com/geekeditor/meditable
 * (c) 2023-2026 montisan <imontisan@gmail.com>
 * Released under the MIT License.
 */
'use strict';

var td = require('./td.js');
var utils = require('../../../../../utils/utils.js');

class METableThRenderer extends td {
    static type = "table-th";
    static tagName = 'th';
    get rowOffset() {
        return this.row.index;
    }
    findNextRow() {
        const { row } = this;
        return row.next || row.parent.next?.firstChild;
    }
    findPreviousRow() {
        const { row } = this;
        return row.previous || null;
    }
    commandEnter(event) {
        const { table } = this;
        const tableRenderer = table.renderer;
        const cell = tableRenderer.insertRow(0);
        cell.renderer.setCursor();
    }
    commandDelete(event) {
        const { table, cell, row } = this;
        const focusRow = this.findNextRow();
        if (focusRow) {
            const index = cell.index;
            const data = {
                id: utils.generateId(),
                type: 'table-tr',
                children: focusRow.data.children.map((c) => {
                    return {
                        ...c,
                        type: 'table-th'
                    };
                })
            };
            const newRow = row.replaceWith({ data });
            const focusBlock = newRow.children[index].firstContentInDescendant();
            focusRow.remove();
            focusBlock.renderer.setCursor();
        }
        else {
            event.preventDefault();
            const data = {
                id: utils.generateId(),
                type: 'paragraph',
                text: ''
            };
            table.replaceWith({ data, needToFocus: true });
        }
    }
}

module.exports = METableThRenderer;
