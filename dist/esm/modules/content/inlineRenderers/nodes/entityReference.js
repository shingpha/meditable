/*!
 * meditable v0.2.1
 * Github: https://github.com/geekeditor/meditable
 * (c) 2023-2026 montisan <imontisan@gmail.com>
 * Released under the MIT License.
 */
import MENode from './node.js';
import { CLASS_NAMES } from '../../../../utils/classNames.js';

// 实体数据缓存：避免同一实体重复请求。key="type/id"。
const entityCache = new Map();
class MEEntityReference extends MENode {
    static type = "entity_reference";
    // 实体引用解析后的结构化数据，供 renderSelf 使用。
    _entityData = {};
    static async staticRender({ data }) {
        const { raw } = data;
        return `<span class="${this.type}">${raw}</span>`;
    }
    get startMarkerNode() {
        return this.nodes.el.firstChild;
    }
    get labelNode() {
        return this.nodes.el.childNodes[1];
    }
    get endMarkerNode() {
        return this.nodes.el.childNodes[2];
    }
    get previewNode() {
        return this.nodes.el.lastElementChild;
    }
    // 解析配置：实体 API 基址 + 单实体端点模板 + onEntityFetch 回调
    get entityConfig() {
        const opts = (this.instance && this.instance.options) || {};
        const entityApiBase = opts.entityApiBase || "";
        const endpoints = opts.entityEndpoints || {};
        const entityTpl = endpoints.entity || "/api/entity/{type}/{id}";
        const onEntityFetch = typeof opts.onEntityFetch === "function" ? opts.onEntityFetch : null;
        return { entityApiBase, entityTpl, onEntityFetch };
    }
    buildUrl(entityType, entityId) {
        const { entityApiBase, entityTpl } = this.entityConfig;
        const path = entityTpl
            .replace(/\{type\}/g, encodeURIComponent(entityType || ""))
            .replace(/\{id\}/g, encodeURIComponent(entityId || ""));
        return entityApiBase + path;
    }
    async loadEntity() {
        const { entityType, entityId } = this._entityData || {};
        if (!entityType || !entityId) {
            this.renderPreview("", "invalid");
            return;
        }
        const key = `${entityType}/${entityId}`;
        const cached = entityCache.get(key);
        if (cached) {
            this.renderPreview(cached);
            return;
        }
        this.renderPreview("", "loading");
        try {
            const { entityApiBase, onEntityFetch } = this.entityConfig;
            let data;
            if (onEntityFetch) {
                data = await onEntityFetch(entityType, entityId);
            }
            else if (entityApiBase !== "none") {
                const resp = await fetch(this.buildUrl(entityType, entityId));
                if (!resp.ok)
                    throw new Error("HTTP " + resp.status);
                data = await resp.json();
            }
            else {
                this.renderPreview("", "noapi");
                return;
            }
            entityCache.set(key, data);
            this.renderPreview(data);
        }
        catch (e) {
            this.renderPreview("", "error");
        }
    }
    // mode 由配置 entityDisplayMode 决定（summary/detail）；缺省 summary。
    renderPreview(dataOrState, explicitState) {
        const preview = this.previewNode;
        if (!preview)
            return;
        const mode = (this.instance.options &&
            this.instance.options.entityDisplayMode) ||
            "summary";
        if (explicitState) {
            const map = {
                loading: "加载中…",
                error: "实体加载失败",
                noapi: "未配置实体 API",
                invalid: "实体引用无效",
            };
            preview.textContent = map[explicitState] || "";
            preview.dataset.state = explicitState;
            return;
        }
        const data = dataOrState || {};
        const name = data.name || this._entityData.label || "(实体)";
        const body = mode === "detail"
            ? data.detail || data.summary || ""
            : data.summary || "";
        preview.dataset.state = "ok";
        preview.dataset.mode = mode;
        preview.innerHTML = "";
        const nameEl = document.createElement("span");
        nameEl.className = "entity-reference-name";
        nameEl.textContent = name;
        preview.appendChild(nameEl);
        if (body) {
            const bodyEl = document.createElement("span");
            bodyEl.className = "entity-reference-body";
            // summary 视为纯文本；detail 允许富文本（innerHTML）由后端保证可信。
            if (mode === "detail")
                bodyEl.innerHTML = body;
            else
                bodyEl.textContent = body;
            preview.appendChild(bodyEl);
        }
    }
    renderSelf(data) {
        const label = data.label || "";
        const entityType = data.entityType || "";
        const entityId = data.entityId || "";
        this._entityData = { label, entityType, entityId };
        if (!this.nodes.el || this.nodes.el.childNodes.length !== 4) {
            this.nodes.el =
                this.nodes.el || this.make("span", [CLASS_NAMES.ME_NODE, "entity-reference"]);
            this.nodes.el.dataset.nodeType = this.type;
            this.nodes.el.dataset.entityType = entityType;
            this.nodes.el.dataset.entityId = entityId;
            this.nodes.el.dataset.label = label;
            // 3 个标记 span + 1 个预览 span（contenteditable=false，编辑态隐藏）。
            // 注意：实体引用形如 !(Text)<type/id>，结束标记含尖括号 < >，
            // 必须用 textContent 赋值，绝不能直接拼接进 innerHTML（会被当成 HTML 标签解析，破坏 DOM 与光标统计）。
            this.nodes.el.innerHTML =
                '<span class="' + CLASS_NAMES.ME_MARKER + '" spellcheck="false"></span>' +
                    '<span class="' + CLASS_NAMES.ME_MARKER + " " + CLASS_NAMES.ME_TEXT + '" spellcheck="false"></span>' +
                    '<span class="' + CLASS_NAMES.ME_MARKER + '" spellcheck="false"></span>';
            this.startMarkerNode.textContent = "!(";
            this.labelNode.textContent = label || "";
            this.endMarkerNode.textContent = ")<" + entityType + "/" + entityId + ">";
            const preview = this.make("span", [CLASS_NAMES.ME_INLINE_RENDER], {
                contenteditable: "false",
                spellcheck: "false",
            });
            this.nodes.el.appendChild(preview);
        }
        else {
            this.nodes.el.dataset.entityType = entityType;
            this.nodes.el.dataset.entityId = entityId;
            this.nodes.el.dataset.label = label;
            if (label !== this.labelNode.textContent)
                this.labelNode.textContent = label;
            const endRaw = ")<" + entityType + "/" + entityId + ">";
            if (endRaw !== this.endMarkerNode.textContent)
                this.endMarkerNode.textContent = endRaw;
        }
        // 失焦渲染预览（聚焦时由 CSS 隐藏预览、显示标记源码）
        this.loadEntity();
    }
}

export { MEEntityReference as default };
