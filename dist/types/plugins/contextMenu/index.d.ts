/*!
 * meditable v0.2.1
 * Github: https://github.com/geekeditor/meditable
 * (c) 2023-2026 montisan <imontisan@gmail.com>
 * Released under the MIT License.
 */
import MEPluginBase from '../base.js';

declare class MEPluginContextMenu extends MEPluginBase {
    static pluginName: string;
    prepare(): Promise<boolean>;
}

export { MEPluginContextMenu as default };
