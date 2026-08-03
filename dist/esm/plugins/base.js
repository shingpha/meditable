/*!
 * meditable v0.2.1
 * Github: https://github.com/geekeditor/meditable
 * (c) 2023-2026 montisan <imontisan@gmail.com>
 * Released under the MIT License.
 */
import MEModule from '../modules/module.js';

class MEPluginBase extends MEModule {
    options;
    constructor(instance, options) {
        super(instance);
        this.options = options || {};
    }
}

export { MEPluginBase as default };
