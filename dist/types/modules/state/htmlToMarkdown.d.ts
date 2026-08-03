/*!
 * meditable v0.2.1
 * Github: https://github.com/geekeditor/meditable
 * (c) 2023-2026 montisan <imontisan@gmail.com>
 * Released under the MIT License.
 */
declare class HtmlToMarkdown {
    private options;
    constructor(options?: {});
    generate(html: any, keeps?: any[]): any;
}

export { HtmlToMarkdown as default };
