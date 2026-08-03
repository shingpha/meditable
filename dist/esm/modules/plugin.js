/*!
 * meditable v0.2.1
 * Github: https://github.com/geekeditor/meditable
 * (c) 2023-2026 montisan <imontisan@gmail.com>
 * Released under the MIT License.
 */
import MEModule from './module.js';

class MEPlugin extends MEModule {
    static plugins = [];
    static use(Plugin, options) {
        this.plugins.push({
            Plugin,
            options
        });
    }
    plugins = {};
    async prepare() {
        if (MEPlugin.plugins.length) {
            for (const { Plugin, options } of MEPlugin.plugins) {
                this.plugins[Plugin.pluginName] = new Plugin(this.instance, options);
            }
        }
        await Object.keys(this.plugins).reduce((promise, pluginName) => promise.then(async () => {
            try {
                await this.plugins[pluginName].prepare();
            }
            catch (e) {
            }
        }), Promise.resolve());
        return true;
    }
    destroy() {
        for (const name of Object.keys(this.plugins)) {
            try {
                this.plugins[name].destroy();
            }
            catch (_) { }
        }
        this.plugins = {};
        super.destroy();
    }
}

export { MEPlugin as default };
