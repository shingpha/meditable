/*!
 * meditable v0.2.1
 * Github: https://github.com/geekeditor/meditable
 * (c) 2023-2026 montisan <imontisan@gmail.com>
 * Released under the MIT License.
 */
import { MEBlockData } from '../../types/index.d.js';

declare class MarkdownToState {
    private options;
    constructor(options?: {});
    generate(markdown: string): MEBlockData;
    convertMarkdownToState(markdown: string): MEBlockData;
}

export { MarkdownToState as default };
