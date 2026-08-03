/*!
 * meditable v0.2.1
 * Github: https://github.com/geekeditor/meditable
 * (c) 2023-2026 montisan <imontisan@gmail.com>
 * Released under the MIT License.
 */
declare const tokenizer: (src: any, { highlights, hasBeginRules, labels, options, }?: {
    highlights?: any[];
    hasBeginRules?: boolean;
    labels?: Map<any, any>;
    options?: {
        superSubScript: boolean;
        footnote: boolean;
    };
}) => any;

export { tokenizer };
