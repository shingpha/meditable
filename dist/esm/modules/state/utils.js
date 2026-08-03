/*!
 * meditable v0.2.1
 * Github: https://github.com/geekeditor/meditable
 * (c) 2023-2026 montisan <imontisan@gmail.com>
 * Released under the MIT License.
 */
import { beginRules } from '../content/inlineRenderers/tokenizer/rules.js';

function collectReferenceDefinitions(state) {
    const labels = new Map();
    const travel = sts => {
        if (Array.isArray(sts) && sts.length) {
            for (const st of sts) {
                if (st.name === 'paragraph') {
                    const { label, info } = getLabelInfo(st);
                    if (label && info) {
                        labels.set(label, info);
                    }
                }
                else if (st.children) {
                    travel(st.children);
                }
            }
        }
    };
    travel(state);
    return labels;
}
function getLabelInfo(block) {
    const { text } = block;
    const tokens = beginRules.reference_definition.exec(text);
    let label = null;
    let info = null;
    if (tokens) {
        label = (tokens[2] + tokens[3]).toLowerCase();
        info = {
            href: tokens[6],
            title: tokens[10] || ''
        };
    }
    return { label, info };
}

export { collectReferenceDefinitions, getLabelInfo };
