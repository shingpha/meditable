/*!
 * meditable v0.2.1
 * Github: https://github.com/geekeditor/meditable
 * (c) 2023-2026 montisan <imontisan@gmail.com>
 * Released under the MIT License.
 */
import plantumlEncoder from 'plantuml-encoder';

class Diagram {
    encodedInput = "";
    /**
     * Builds a Diagram object storing the encoded input value
     */
    static parse(input) {
        const diagram = new Diagram();
        diagram.encode(input);
        return diagram;
    }
    /**
     * Encodes a diagram following PlantUML specs, I used `plantuml-encoder` at last.
     *
     * From https://plantuml.com/text-encoding
     * 1. Encoded in UTF-8
     * 2. Compressed using Deflate or Brotli algorithm
     * 3. Re-encoded in ASCII using a transformation close to base64
     */
    encode(value) {
        this.encodedInput = plantumlEncoder.encode(value);
    }
    async insertElement(container) {
        const PLANTUML_URL = "https://www.plantuml.com/plantuml";
        const div = typeof container === "string"
            ? document.getElementById(container)
            : container;
        if (div === null || !div.tagName) {
            throw new Error("Invalid container: " + container);
        }
        const src = `${PLANTUML_URL}/svg/${this.encodedInput}`;
        return fetch(src)
            .then((response) => response.text())
            .then((svg) => div.innerHTML = svg);
        // div.innerHTML = `<img src="${src}" >`;
    }
}

export { Diagram as default };
