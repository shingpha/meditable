/*!
 * meditable v0.2.1
 * Github: https://github.com/geekeditor/meditable
 * (c) 2023-2026 montisan <imontisan@gmail.com>
 * Released under the MIT License.
 */
import MEPluginBase from '../base.js';

class MEPluginContextMenu extends MEPluginBase {
    static pluginName = "contextMenu";
    async prepare() {
        const { layout } = this.instance.context;
        this.mutableListeners.on(layout.nodes.wrapper, 'contextmenu', (event) => {
            event.preventDefault();
            event.stopPropagation();
        });
        return true;
    }
}

export { MEPluginContextMenu as default };
