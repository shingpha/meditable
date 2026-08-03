/*!
 * meditable v0.2.1
 * Github: https://github.com/geekeditor/meditable
 * (c) 2023-2026 montisan <imontisan@gmail.com>
 * Released under the MIT License.
 */
/**
 * Helpers
 */
let uniqueIdCounter = 0;
const getUniqueId = () => ++uniqueIdCounter;
const edit = function edit(regex, opt) {
    regex = regex.source || regex;
    opt = opt || "";
    return {
        replace: function (name, val) {
            val = val.source || val;
            val = val.replace(/(^|[^\[])\^/g, "$1"); // eslint-disable-line no-useless-escape
            regex = regex.replace(name, val);
            return this;
        },
        getRegex: function () {
            return new RegExp(regex, opt);
        },
    };
};
const noop = function noop() { };
noop.exec = noop;
const splitCells = function splitCells(tableRow, count) {
    // ensure that every cell-delimiting pipe has a space
    // before it to distinguish it from an escaped pipe
    const row = tableRow.replace(/\|/g, function (match, offset, str) {
        let escaped = false;
        let curr = offset;
        while (--curr >= 0 && str[curr] === "\\")
            escaped = !escaped;
        if (escaped) {
            // odd number of slashes means | is escaped
            // so we leave it alone
            return "|";
        }
        else {
            // add space before unescaped |
            return " |";
        }
    });
    const cells = row.split(/ \|/);
    let i = 0;
    if (count) {
        if (cells.length > count) {
            cells.splice(count);
        }
        else {
            while (cells.length < count)
                cells.push("");
        }
    }
    for (; i < cells.length; i++) {
        // leading or trailing whitespace is ignored per the gfm spec
        cells[i] = cells[i].trim().replace(/\\\|/g, "|");
    }
    return cells;
};
// Remove trailing 'c's. Equivalent to str.replace(/c*$/, '').
// /c*$/ is vulnerable to REDOS.
// invert: Remove suffix of non-c chars instead. Default falsey.
const rtrim = function rtrim(str, c, invert) {
    if (str.length === 0) {
        return "";
    }
    // Length of suffix matching the invert condition.
    let suffLen = 0;
    // Step left until we fail to match the invert condition.
    while (suffLen < str.length) {
        const currChar = str.charAt(str.length - suffLen - 1);
        if (currChar === c && !invert) {
            suffLen++;
        }
        else if (currChar !== c && invert) {
            suffLen++;
        }
        else {
            break;
        }
    }
    return str.substr(0, str.length - suffLen);
};
const findClosingBracket = function findClosingBracket(str, b) {
    if (str.indexOf(b[1]) === -1) {
        return -1;
    }
    let level = 0;
    for (let i = 0; i < str.length; i++) {
        if (str[i] === "\\") {
            i++;
        }
        else if (str[i] === b[0]) {
            level++;
        }
        else if (str[i] === b[1]) {
            level--;
            if (level < 0) {
                return i;
            }
        }
    }
    return -1;
};

export { edit, findClosingBracket, getUniqueId, noop, rtrim, splitCells };
