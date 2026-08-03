/*!
 * meditable v0.2.1
 * Github: https://github.com/geekeditor/meditable
 * (c) 2023-2026 montisan <imontisan@gmail.com>
 * Released under the MIT License.
 */
import { MEBlockData, MENodeData } from '../../types/index.d.js';

declare class StateToPlainText {
    private labels;
    generate(states: MEBlockData[], asFile?: boolean): string;
    convertStatesToPlainText(states: MEBlockData[]): string;
    stateToPlainText(state: MEBlockData): string;
    tokensToPlainText(tokens: MENodeData[]): string;
}

export { StateToPlainText as default };
