/*!
 * meditable v0.2.1
 * Github: https://github.com/geekeditor/meditable
 * (c) 2023-2026 montisan <imontisan@gmail.com>
 * Released under the MIT License.
 */
'use strict';

var utils = require('../utils/utils.js');
var domUtils = require('../utils/domUtils.js');
var module$1 = require('./module.js');
var classNames = require('../utils/classNames.js');
var Viewer = require('viewerjs');
require('viewerjs/dist/viewer.css');

class MELayout extends module$1 {
    nodes = {};
    containerRectCache;
    resizeDebouncer = utils.debounce(() => {
        this.containerResize();
    }, 200);
    /**
     * Resize handler
     */
    containerResize() {
        /**
         * Invalidate scroll zone size cached, because it may be changed
         */
        this.containerRectCache = null;
    }
    get containerRect() {
        if (this.containerRectCache) {
            return this.containerRectCache;
        }
        this.containerRectCache = this.nodes.scroller.getBoundingClientRect();
        return this.containerRectCache;
    }
    async prepare() {
        /**
         * Make main MELayout elements
         */
        await this.make();
        const observer = new ResizeObserver(entries => {
            this.resizeDebouncer();
        });
        observer.observe(this.nodes.scroller);
        return true;
    }
    toggleFocusMode(focusMode) {
        this.instance.setOption("focusMode", focusMode);
        this.nodes.editor.classList.toggle(`${classNames.CLASS_NAMES.MEUI_EDITOR__FOCUS_MODE}`, focusMode);
    }
    viewImage(container) {
        const photoViewer = new Viewer(container, {
            inline: false,
            fullscreen: true,
            title: true,
            zIndex: 10000,
            container: this.nodes.wrapper,
            toolbar: {
                zoomIn: 1,
                zoomOut: 1,
                oneToOne: 1,
                reset: 1,
                prev: 0,
                play: 0,
                next: 0,
                rotateLeft: 1,
                rotateRight: 1,
                flipHorizontal: 1,
                flipVertical: 1,
            },
            hidden() {
                photoViewer.destroy();
            },
            show() {
                photoViewer.full();
            },
        });
        photoViewer.show();
    }
    destroy() {
        this.nodes.holder.innerHTML = '';
    }
    async make() {
        this.nodes.holder = this.instance.container;
        await this.makeWithCommonMode();
    }
    makeEditor() {
        this.nodes.wrapper = domUtils.make('div', [
            classNames.CLASS_NAMES.MEUI_WRAPPER,
        ]);
        this.nodes.scroller = domUtils.make('div', [
            classNames.CLASS_NAMES.MEUI_SCROLLER,
        ]);
        this.nodes.presentation = domUtils.make('div', [
            classNames.CLASS_NAMES.MEUI_PRESENTATION,
        ]);
        this.nodes.holder.appendChild(this.nodes.wrapper);
        this.nodes.wrapper.appendChild(this.nodes.scroller);
        this.nodes.wrapper.appendChild(this.nodes.presentation);
        const classes = [
            classNames.CLASS_NAMES.MEUI_EDITOR,
        ];
        if (this.instance.options.focusMode) {
            classes.push(classNames.CLASS_NAMES.MEUI_EDITOR__FOCUS_MODE);
        }
        this.nodes.editor = domUtils.make('div', classes);
        this.nodes.scroller.appendChild(this.nodes.editor);
        this.mutableListeners.on(this.nodes.scroller, 'scroll', (event) => {
            const scrollerState = this.scrollerState;
            this.nodes.presentation.classList.toggle(`${classNames.CLASS_NAMES.MEUI_SCROLLER_DECORATION}`, scrollerState.scrollTop > 4);
            this.instance.context.event.trigger('scroll', scrollerState);
        });
    }
    get scrollerState() {
        const { scrollTop, scrollHeight } = this.nodes.scroller;
        const containerRect = this.containerRect;
        this.nodes.presentation.classList.toggle(`${classNames.CLASS_NAMES.MEUI_SCROLLER_DECORATION}`, scrollTop > 4);
        const pointX = containerRect.x + containerRect.width / 2.0;
        const pointY = containerRect.y;
        const elements = this.instance.context.editable.document.elementsFromPoint(pointX, pointY);
        const targetBlock = elements.find((el) => el.classList.contains(`${classNames.CLASS_NAMES.ME_BLOCK}`));
        return {
            scrollTop, scrollTopBlockId: targetBlock && targetBlock.dataset.id
        };
    }
    async makeWithCommonMode() {
        this.makeEditor();
        this.nodes.zone = domUtils.make('div', classNames.CLASS_NAMES.MEUI_EDITOR_ZONE);
        this.nodes.editor.appendChild(this.nodes.zone);
        this.nodes.content = domUtils.make('div', [classNames.CLASS_NAMES.MEUI_EDITOR_CONTENT, classNames.CLASS_NAMES.ME_CONTENT]);
        this.nodes.content.dataset.typeset = 'default';
        this.nodes.zone.appendChild(this.nodes.content);
        this.instance.context.editable.mount(this.nodes.content, this.nodes.content.ownerDocument.getSelection());
    }
}

module.exports = MELayout;
