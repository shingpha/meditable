/*!
 * meditable v0.2.1
 * Github: https://github.com/geekeditor/meditable
 * (c) 2023-2026 montisan <imontisan@gmail.com>
 * Released under the MIT License.
 */
import { MEModuleInstance, MEInstance } from '../types/index.d.js';

type ModuleNodes = object;
declare abstract class MEModule<T extends ModuleNodes = {}> implements MEModuleInstance {
    readonly nodes: T;
    readonly mutableListeners: {
        on: (element: EventTarget, eventType: string, handler: (event: Event) => void, options?: boolean | AddEventListenerOptions) => string;
        clearAll: () => void;
    };
    private mutableListenerIds;
    instance: MEInstance;
    constructor(instance: MEInstance);
    t(key: string): string;
    prepare(): Promise<boolean>;
    destroy(): void;
}

export { ModuleNodes, MEModule as default };
