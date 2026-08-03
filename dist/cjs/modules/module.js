/*!
 * meditable v0.2.1
 * Github: https://github.com/geekeditor/meditable
 * (c) 2023-2026 montisan <imontisan@gmail.com>
 * Released under the MIT License.
 */
'use strict';

class MEModule {
    nodes = {};
    mutableListeners = {
        on: (element, eventType, handler, options = false) => {
            const id = this.instance.eventListeners.on(element, eventType, (event) => {
                const { editable } = this.instance.context;
                if (!editable.actived)
                    return;
                handler(event);
            }, options);
            if (id) {
                this.mutableListenerIds.push(id);
            }
            return id;
        },
        clearAll: () => {
            for (const id of this.mutableListenerIds) {
                this.instance.eventListeners.off(id);
            }
            this.mutableListenerIds = [];
        },
    };
    mutableListenerIds = [];
    instance;
    constructor(instance) {
        this.instance = instance;
    }
    t(key) {
        return this.instance.t(key);
    }
    async prepare() {
        return true;
    }
    ;
    destroy() {
        this.mutableListeners.clearAll();
    }
}

module.exports = MEModule;
