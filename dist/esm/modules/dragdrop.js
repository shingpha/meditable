/*!
 * meditable v0.2.1
 * Github: https://github.com/geekeditor/meditable
 * (c) 2023-2026 montisan <imontisan@gmail.com>
 * Released under the MIT License.
 */
import MEModule from './module.js';

class MEDragDrop extends MEModule {
    async prepare() {
        this.dispatchEvents();
        return true;
    }
    dispatchEvents() {
        const { event, editable } = this.instance.context;
        event.on("drop", async (type, event) => {
            await this.processDrop(event);
        });
        event.on("dragstart", (type, event) => {
            this.processDragStart();
        });
        event.on("dragover", (type, event) => {
            this.processDragOver(event);
        });
    }
    async processDrop(dropEvent) {
        const { content, clipboard, } = this.instance.context;
        dropEvent.preventDefault();
        const targetBlock = content.dropTargetBlock || content.lastChild;
        content.clearDropTargetBlock();
        if (targetBlock) {
            targetBlock.renderer.setCursor({ focus: { offset: targetBlock.renderer.text.length } });
            await clipboard.processDataTransfer(targetBlock, dropEvent.dataTransfer, true);
        }
    }
    processDragStart() {
    }
    processDragOver(dragEvent) {
        dragEvent.preventDefault();
    }
}

export { MEDragDrop as default };
