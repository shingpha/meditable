/*!
 * meditable v0.2.1
 * Github: https://github.com/geekeditor/meditable
 * (c) 2023-2026 montisan <imontisan@gmail.com>
 * Released under the MIT License.
 */
'use strict';

require('../../../utils/classNames.js');
require('../inlineRenderers/tokenizer/rules.js');
require('../../../utils/marked/utils.js');

const getImageSrc = (src) => {
    const EXT_REG = /\.(jpeg|jpg|png|gif|svg|webp)(?=\?|$)/i;
    // http[s] (domain or IPv4 or localhost or IPv6) [port] /not-white-space
    const URL_REG = /^http(s)?:\/\/([a-z0-9\-._~]+\.[a-z]{2,}|[0-9.]+|localhost|\[[a-f0-9.:]+\])(:[0-9]{1,5})?\/[\S]+/i;
    const DATA_URL_REG = /^data:image\/[\w+-]+(;[\w-]+=[\w-]+|;base64)*,[a-zA-Z0-9+/]+={0,2}$/;
    const BLOB_URL_REG = /^blob:/;
    const imageExtension = EXT_REG.test(src);
    const isUrl = URL_REG.test(src);
    if (imageExtension) {
        if (isUrl) {
            return {
                isUnknownType: false,
                src,
                isBlobType: false
            };
        }
        else {
            return {
                isUnknownType: true,
                src,
                isBlobType: false
            };
        }
    }
    else if (isUrl && !imageExtension) {
        return {
            isUnknownType: true,
            src,
            isBlobType: false
        };
    }
    else {
        const isDataUrl = DATA_URL_REG.test(src);
        if (isDataUrl) {
            return {
                isUnknownType: false,
                src,
                isBlobType: false
            };
        }
        else {
            const isBlobType = BLOB_URL_REG.test(src);
            return {
                isUnknownType: true,
                src,
                isBlobType
            };
        }
    }
};
const imageMap = new Map();
const urlMap = new Map();
const imageUtils = {
    createObjectURL(file) {
        const url = URL.createObjectURL(file);
        imageMap.set(url, file);
        return url;
    },
    getObjectURL(src) {
        const url = urlMap.get(src);
        return url;
    },
    setObjectURL(src, url) {
        urlMap.set(src, url);
    },
    getFileWithURL(url) {
        const file = imageMap.get(url);
        return file;
    },
    clearURL(url) {
        imageMap.set(url, null);
    }
};
function selectFiles(config = {}) {
    return new Promise((resolve, reject) => {
        /**
         * Create a new INPUT element
         * @type {HTMLElement}
         */
        let inputElement = document.createElement('INPUT');
        /**
         * Set a 'FILE' type for this input element
         * @type {string}
         */
        inputElement.type = 'file';
        if (config.multiple) {
            inputElement.setAttribute('multiple', 'multiple');
        }
        if (config.accept) {
            inputElement.setAttribute('accept', config.accept);
        }
        /**
         * Do not show element
         */
        inputElement.style.display = 'none';
        /**
         * Append element to the body
         * Fix using module on mobile devices
         */
        document.body.appendChild(inputElement);
        /**
         * Add onchange listener for «choose file» pop-up
         */
        inputElement.addEventListener('change', event => {
            /**
             * Get files from input field
             */
            const files = event.target?.files;
            /**
             * Return ready to be uploaded files array
             */
            resolve(files);
            /**
             * Remove element from a DOM
             */
            document.body.removeChild(inputElement);
        }, false);
        /**
         * Fire click event on «input file» field
         */
        inputElement.click();
    });
}

exports.getImageSrc = getImageSrc;
exports.imageUtils = imageUtils;
exports.selectFiles = selectFiles;
