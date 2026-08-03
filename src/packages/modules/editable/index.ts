import MEModule from "@/packages/modules/module";
import MESelection from "./selection";
import { CLASS_NAMES } from "@/packages/utils/classNames";
import env from "@/packages/utils/env";


export default class MEEditable extends MEModule {

    private _holder!: HTMLElement;
    private _rootDocNode!: Node;
    private _actived!: boolean;
    private _selection!: MESelection;
    private _document!: HTMLDocument;
    private _window!: Window;
    private _enabled!: boolean;

    get holder() {
        return this._holder;
    }

    get rootNode() {
        return this._rootDocNode;
    }

    get actived() {
        return this._actived;
    }

    set actived(actived: boolean) {
        this._actived = actived;
        const event = this.instance.context.event;
        event.trigger("actived")
    }

    get enabled() {
        return this._enabled;
    }

    set enabled(enabled: boolean) {
        this._enabled = enabled;
    }

    get selection() {
        return this._selection;
    }

    get document() {
        return this._document;
    }

    get window() {
        return this._window;
    }

    public mount(el: HTMLElement, selection?: Selection | null) {
        this._rootDocNode = el.getRootNode();
        if (el.nodeType !== 1 || !el.ownerDocument || !this._rootDocNode || (this._rootDocNode.nodeType !== 9 && this._rootDocNode.nodeType !== 11)) throw "el is invalid!";

        const { spellcheckEnabled = false } = this.instance.options
        this._holder = el;
        this._holder.setAttribute("contenteditable", "true");
        
        this._holder.setAttribute("spellcheck", spellcheckEnabled ? "true" : "false");
        this._holder.style.cursor = "text";
        this._holder.dataset.root = 'root'

        this._document = el.ownerDocument;
        this._window = this._document.defaultView as Window;

        this._selection = new MESelection(
            el.ownerDocument,
            this._holder,
            this.instance
        );

        this._actived = true;

        this.mutableListeners.on(this._holder, "mousedown", (event)=>{
            const mouseEvent = event as MouseEvent;
            if(mouseEvent.ctrlKey || mouseEvent.metaKey) {
                const target = mouseEvent.target as Element;
                const anchor = target.nodeType === 3 ? target.parentElement?.closest("a") : target.closest("a");
                if(anchor && anchor.href) {
                    const {linkClick} = this.instance.options;
                    if(linkClick) {
                        linkClick(anchor.href)
                    } else {
                        this.window.open(anchor.href, "_blank")
                    }
                    event.preventDefault();
                    event.stopPropagation();
                }
            }
        }, true);
        // Fix 2: 点击编辑器内、位于 .me-editable 之外的空白死区（标题上方/底部
        // padding 区）时，把光标吸附到「按点击 y 坐标最近的 .me-editable」对应的块。
        // 否则原生光标会落在根 contenteditable，导致方向键被 content/index.js 丢弃。
        // 监听绑在 document（捕获阶段），确保点击落在 holder 之外的 padding 死区
        // 时也能拦截；使用库自带 API（block.renderer.setCursor）写入光标，不破坏内部状态机。
        this.mutableListeners.on(this._document, "mousedown", (event: any) => {
            const me = event;
            const target = me.target;
            if (!target) return;
            const editorArea = target.closest(".meui-editor") || this._holder;
            if (!editorArea.contains(target)) return;
            const inEditable = (node: any) => {
                let n = node;
                while (n && n !== editorArea) {
                    if (n.nodeType === 1 && n.classList && n.classList.contains("me-editable")) return true;
                    n = n.parentNode;
                }
                return false;
            };
            if (inEditable(target)) return;
            const editables = Array.from(this._holder.querySelectorAll(".me-editable")) as any[];
            if (!editables.length) return;
            me.preventDefault();
            const y = me.clientY;
            let targetEl = editables[0];
            for (const el of editables) {
                const r = el.getBoundingClientRect();
                if (y >= r.top) targetEl = el;
            }
            const last = editables[editables.length - 1];
            const rect = targetEl.getBoundingClientRect();
            const atEnd = targetEl === last && y > rect.top + rect.height / 2;
            setTimeout(() => {
                try {
                    const blockEl = targetEl.closest(".me-block");
                    const bi = blockEl && (blockEl as any).BLOCK_INSTANCE;
                    if (bi && bi.renderer && bi.renderer.setCursor) {
                        bi.renderer.setCursor({ focus: { offset: atEnd ? bi.renderer.text.length : 0 }, scrollToView: false });
                    }
                } catch (e) { /* noop */ }
            }, 0);
        }, true);
        this.mutableListeners.on(this._holder, "mousemove", (event)=>{
            const mouseEvent = event as MouseEvent;
            this._holder.classList.toggle(CLASS_NAMES.ME_CONTENT__CONTROLLING, mouseEvent.ctrlKey||mouseEvent.metaKey)
        }, true);
        this.mutableListeners.on(this._document, "keydown", (event)=>{
            const keyEvent = event as KeyboardEvent;
            if(keyEvent.key === 'Control' || keyEvent.key === 'Meta') {
                this._holder.classList.toggle(CLASS_NAMES.ME_CONTENT__CONTROLLING, true)
            }
        }, true);
        this.mutableListeners.on(this._document, "keyup", (event)=>{
            const keyEvent = event as KeyboardEvent;
            if(keyEvent.key === 'Control' || keyEvent.key === 'Meta') {
                this._holder.classList.toggle(CLASS_NAMES.ME_CONTENT__CONTROLLING, false)
            }
        }, true);

        return this;
    }

    destroy() {
        super.destroy();
        this._actived = false;
    }
    
}