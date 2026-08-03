/*!
 * meditable v0.2.1
 * Github: https://github.com/geekeditor/meditable
 * (c) 2023-2026 montisan <imontisan@gmail.com>
 * Released under the MIT License.
 */
'use strict';

var javascript = require('highlight.js/lib/languages/javascript');
var apache = require('highlight.js/lib/languages/apache');
var bash = require('highlight.js/lib/languages/bash');
var shell = require('highlight.js/lib/languages/shell');
var csharp = require('highlight.js/lib/languages/csharp');
var cpp = require('highlight.js/lib/languages/cpp');
var css = require('highlight.js/lib/languages/css');
var typescript = require('highlight.js/lib/languages/taggerscript');
var diff = require('highlight.js/lib/languages/diff');
var xml = require('highlight.js/lib/languages/xml');
var http = require('highlight.js/lib/languages/http');
var ini = require('highlight.js/lib/languages/ini');
var json = require('highlight.js/lib/languages/json');
var java = require('highlight.js/lib/languages/java');
var makefile = require('highlight.js/lib/languages/makefile');
var markdown = require('highlight.js/lib/languages/markdown');
var nginx = require('highlight.js/lib/languages/nginx');
var objectivec = require('highlight.js/lib/languages/objectivec');
var php = require('highlight.js/lib/languages/php');
var perl = require('highlight.js/lib/languages/perl');
var properties = require('highlight.js/lib/languages/properties');
var python = require('highlight.js/lib/languages/python');
var ruby = require('highlight.js/lib/languages/ruby');
var sql = require('highlight.js/lib/languages/sql');
var powershell = require('highlight.js/lib/languages/powershell');
var swift = require('highlight.js/lib/languages/swift');
var kotlin = require('highlight.js/lib/languages/kotlin');
var go = require('highlight.js/lib/languages/go');
var latex = require('highlight.js/lib/languages/latex');
var yaml = require('highlight.js/lib/languages/yaml');

const Languages = {
    javascript,
    apache,
    bash,
    shell,
    csharp,
    cpp,
    css,
    typescript,
    diff,
    xml,
    http,
    ini,
    json,
    java,
    makefile,
    markdown,
    nginx,
    objectivec,
    php,
    perl,
    properties,
    python,
    ruby,
    sql,
    powershell,
    swift,
    kotlin,
    go,
    latex,
    yaml
};

exports.Languages = Languages;
