/*!
 * meditable v0.2.1
 * Github: https://github.com/geekeditor/meditable
 * (c) 2023-2026 montisan <imontisan@gmail.com>
 * Released under the MIT License.
 */
// const inlineTags = ['strong', 'b', 'del', 's', 'strike', 'em', 'i','mark','u','code','sup', 'sub', 'math', 'kbd']
const COMMAND_TYPE_MAP = {
    bold: "strong",
    italic: "em",
    inline_code: "inline_code",
    subscript: "sub",
    superscript: "sup",
    underline: "u",
    strikethrough: "del",
    mark: "mark",
    inline_math: "inline_math",
};
const getCommand = (cmdName, shortcutKeys) => {
    return {
        cmdName,
        execCommand(cmdName) {
            this.execCommand('format', { type: COMMAND_TYPE_MAP[cmdName] });
        },
        queryCommandState() {
            return 0;
        },
        shortcutKeys,
    };
};
const bold = getCommand('bold', {
    "Ctrl+B": {}
});
const italic = getCommand('italic', {
    "Ctrl+I": {}
});
const subscript = getCommand('subscript', {
    "Ctrl+Shift+,": {}
});
const supscript = getCommand('superscript', {
    "Ctrl+Shift+.": {}
});
const underline = getCommand('underline', {
    "Ctrl+U": {}
});
const strikethrough = getCommand('strikethrough', {
    "Ctrl+D": {}
});
const mark = getCommand('mark', {
    "Ctrl+M": {}
});
const code = getCommand('inline_code', {
    "Ctrl+E": {}
});
const math = getCommand('inline_math', {
    "Ctrl+Shift+M": {}
});

export { COMMAND_TYPE_MAP, bold, code, italic, mark, math, strikethrough, subscript, supscript, underline };
