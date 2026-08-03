/*!
 * meditable v0.2.1
 * Github: https://github.com/geekeditor/meditable
 * (c) 2023-2026 montisan <imontisan@gmail.com>
 * Released under the MIT License.
 */
import { generateId } from './utils.js';

class EventListeners {
    allEventListeners = [];
    /**
     * Assigns event listener on element and returns unique identifier
     *
     * @param {EventTarget} element - DOM element that needs to be listened
     * @param {string} eventType - event type
     * @param {Function} handler - method that will be fired on event
     * @param {boolean|AddEventListenerOptions} options - useCapture or {capture, passive, once}
     *
     * @returns {string}
     */
    on(element, eventType, handler, options = false) {
        const id = generateId();
        const assignedEventData = {
            id,
            element,
            eventType,
            handler,
            options,
        };
        const alreadyExist = this.allEventListeners.some((listener) => {
            if (listener.element === element && listener.eventType === eventType && listener.handler === handler) {
                return true;
            }
            return false;
        });
        if (alreadyExist) {
            return;
        }
        this.allEventListeners.push(assignedEventData);
        element.addEventListener(eventType, handler, options);
        return id;
    }
    /**
     * Removes listener by id
     *
     * @param {string} id - listener identifier
     */
    off(id) {
        const listener = this.allEventListeners.find((listener) => listener.id === id);
        if (!listener) {
            return;
        }
        listener.element.removeEventListener(listener.eventType, listener.handler, listener.options);
    }
    /**
     * Removes all listeners
     */
    removeAllEventListeners() {
        this.allEventListeners.map((listener) => {
            listener.element.removeEventListener(listener.eventType, listener.handler, listener.options);
        });
        this.allEventListeners = [];
    }
}

export { EventListeners as default };
