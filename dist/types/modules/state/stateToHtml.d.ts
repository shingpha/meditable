/*!
 * meditable v0.2.1
 * Github: https://github.com/geekeditor/meditable
 * (c) 2023-2026 montisan <imontisan@gmail.com>
 * Released under the MIT License.
 */
import { MENodeRendererStaticRenderOptions, MEBlockRendererStaticRenderOptions, MEDiagramHtmlType, MEBlockData, MENodeData } from '../../types/index.d.js';

declare class StateToHtml {
    private diagramHtmlType;
    private staticNodeHtmlRenderer?;
    private staticBlockHtmlRenderer?;
    private labels;
    constructor(options?: {
        staticNodeHtmlRenderer?: (options: MENodeRendererStaticRenderOptions, renderedHtml: string) => Promise<string>;
        staticBlockHtmlRenderer?: (options: MEBlockRendererStaticRenderOptions, renderedHtml: string) => Promise<string>;
        diagramHtmlType?: MEDiagramHtmlType | {
            mermaid?: MEDiagramHtmlType;
            flowchart?: MEDiagramHtmlType;
            sequence?: MEDiagramHtmlType;
            "vega-lite"?: MEDiagramHtmlType;
            plantuml?: MEDiagramHtmlType;
        };
    });
    generate(states: MEBlockData[], asFile?: boolean): Promise<string>;
    convertStatesToHtml(states: MEBlockData[]): Promise<string>;
    stateToHtml(state: MEBlockData): Promise<string>;
    tokensToHtml(tokens: MENodeData[]): Promise<string>;
}

export { StateToHtml as default };
