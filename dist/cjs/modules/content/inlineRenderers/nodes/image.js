/*!
 * meditable v0.2.1
 * Github: https://github.com/geekeditor/meditable
 * (c) 2023-2026 montisan <imontisan@gmail.com>
 * Released under the MIT License.
 */
'use strict';

var htmlImg = require('./htmlImg.js');

class MEImage extends htmlImg {
    static type = "image";
}

module.exports = MEImage;
