/*!
 * meditable v0.2.1
 * Github: https://github.com/geekeditor/meditable
 * (c) 2023-2026 montisan <imontisan@gmail.com>
 * Released under the MIT License.
 */
import MEPluginBase from '../base.js';
import { MEInstance, MEPluginOptions } from '../../types/index.d.js';
import { CustomButtonItem } from './buttons.js';

interface BubbleToolbarOptions extends MEPluginOptions {
    items?: Array<string | '|' | CustomButtonItem>;
    showDelay?: number;
    offset?: number;
}
declare class MEPluginBubbleToolbar extends MEPluginBase {
    static pluginName: string;
    private toolbar;
    private items;
    private cachedCursor;
    private lastActiveMap;
    private lastEnabledMap;
    private updateScheduled;
    private scrollListener?;
    constructor(instance: MEInstance, options?: BubbleToolbarOptions);
    prepare(): Promise<boolean>;
    private handleSelectionChange;
    private execCmd;
    destroy(): void;
}

export { BubbleToolbarOptions, MEPluginBubbleToolbar as default };
