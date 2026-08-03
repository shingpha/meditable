/*!
 * meditable v0.2.1
 * Github: https://github.com/geekeditor/meditable
 * (c) 2023-2026 montisan <imontisan@gmail.com>
 * Released under the MIT License.
 */
declare class EventListeners {
    private allEventListeners;
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
    on(element: EventTarget, eventType: string, handler: (event: Event) => void, options?: boolean | AddEventListenerOptions): string | undefined;
    /**
     * Removes listener by id
     *
     * @param {string} id - listener identifier
     */
    off(id: string): void;
    /**
     * Removes all listeners
     */
    removeAllEventListeners(): void;
}

export { EventListeners as default };
