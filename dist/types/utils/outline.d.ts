/*!
 * meditable v0.2.1
 * Github: https://github.com/geekeditor/meditable
 * (c) 2023-2026 montisan <imontisan@gmail.com>
 * Released under the MIT License.
 */
import { MEBlockData, MEOutlineItem } from '../types/index.d.js';

declare function flattenToOutline(data: MEBlockData): MEOutlineItem[];
declare function filterOutline(outline: MEOutlineItem[], { filterKey, filterTypeRegex }: {
    filterKey?: string;
    filterTypeRegex?: RegExp;
}): MEOutlineItem[];

export { filterOutline, flattenToOutline };
