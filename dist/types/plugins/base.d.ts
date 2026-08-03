/*!
 * meditable v0.2.1
 * Github: https://github.com/geekeditor/meditable
 * (c) 2023-2026 montisan <imontisan@gmail.com>
 * Released under the MIT License.
 */
import MEModule from '../modules/module.js';
import { MEPluginInstance, MEPluginOptions, MEInstance } from '../types/index.d.js';

declare class MEPluginBase extends MEModule implements MEPluginInstance {
    protected options: MEPluginOptions;
    constructor(instance: MEInstance, options?: MEPluginOptions);
}

export { MEPluginBase as default };
