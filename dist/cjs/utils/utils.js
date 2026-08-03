/*!
 * meditable v0.2.1
 * Github: https://github.com/geekeditor/meditable
 * (c) 2023-2026 montisan <imontisan@gmail.com>
 * Released under the MIT License.
 */
'use strict';

var env = require('./env.js');

let gFactor = Date.now();
function generateId(factor) {
    factor = factor || (gFactor++);
    // tslint:disable-next-line:no-bitwise
    return `${Number(Math.random().toString().substr(2, 10) + factor).toString(36)}`;
}
function debounce(func, wait, immediate) {
    let timeout;
    return function () {
        // eslint-disable-next-line @typescript-eslint/no-this-alias
        const context = this, 
        // eslint-disable-next-line prefer-rest-params
        args = arguments;
        // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
        const later = () => {
            timeout = null;
            if (!immediate) {
                func.apply(context, args);
            }
        };
        const callNow = immediate && !timeout;
        window.clearTimeout(timeout);
        timeout = window.setTimeout(later, wait);
        if (callNow) {
            func.apply(context, args);
        }
    };
}
const deepCopyArray = (array) => {
    const result = [];
    const len = array.length;
    let i;
    for (i = 0; i < len; i++) {
        if (typeof array[i] === "object" && array[i] !== null) {
            if (Array.isArray(array[i])) {
                result.push(deepCopyArray(array[i]));
            }
            else {
                result.push(deepCopy(array[i]));
            }
        }
        else {
            result.push(array[i]);
        }
    }
    return result;
};
const deepCopy = (object) => {
    const obj = {};
    Object.keys(object).forEach((key) => {
        if (typeof object[key] === "object" && object[key] !== null) {
            if (Array.isArray(object[key])) {
                obj[key] = deepCopyArray(object[key]);
            }
            else {
                obj[key] = deepCopy(object[key]);
            }
        }
        else {
            obj[key] = object[key];
        }
    });
    return obj;
};
const identity = (i) => i;
function canCopyBlob() {
    return typeof ClipboardItem !== 'undefined' && !env.safari;
}
async function copyBlob(blob) {
    if (canCopyBlob()) {
        const data = [
            new ClipboardItem({
                [blob.type]: blob
            })
        ];
        return navigator.clipboard.write(data);
    }
}
function download(filename, content, contentType) {
    contentType = contentType || (content instanceof Blob ? content.type : 'application/octet-stream');
    const a = document.createElement('a');
    const blob = new Blob([content], { 'type': contentType });
    a.href = window.URL.createObjectURL(blob);
    a.download = filename;
    a.click();
}
async function saveToDisk(filename, content, down) {
    const supportFSA = typeof window.showSaveFilePicker === 'function';
    if (!down && supportFSA) {
        const fileHandle = await window.showSaveFilePicker({
            suggestedName: filename
        });
        // Create a FileSystemWritableFileStream to write to.
        const writable = await fileHandle.createWritable();
        // Write the contents of the file to the stream.
        await writable.write(content);
        // Close the file and write the contents to disk.
        writable.close();
    }
    else {
        download(filename, content);
    }
}

exports.canCopyBlob = canCopyBlob;
exports.copyBlob = copyBlob;
exports.debounce = debounce;
exports.deepCopy = deepCopy;
exports.deepCopyArray = deepCopyArray;
exports.download = download;
exports.generateId = generateId;
exports.identity = identity;
exports.saveToDisk = saveToDisk;
