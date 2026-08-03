/*!
 * meditable v0.2.1
 * Github: https://github.com/geekeditor/meditable
 * (c) 2023-2026 montisan <imontisan@gmail.com>
 * Released under the MIT License.
 */
import { MENodeData } from '../../types/index.d.js';

interface CustomButtonItem {
    cmdName: string;
    tooltip?: string;
    icon: string;
    isActive?: (ctx: ActiveCtx) => boolean;
    isEnabled?: (ctx: ActiveCtx) => boolean;
}
interface ActiveCtx {
    formats: MENodeData[];
}

export { ActiveCtx, CustomButtonItem };
