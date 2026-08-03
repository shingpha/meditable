/*!
 * meditable v0.2.1
 * Github: https://github.com/geekeditor/meditable
 * (c) 2023-2026 montisan <imontisan@gmail.com>
 * Released under the MIT License.
 */
import { Base64 } from 'js-base64';

function imgURLToBlob(url) {
    return new Promise((resolve) => {
        const img = new Image();
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        img.src = url;
        img.onload = () => {
            canvas.width = img.naturalWidth || img.width;
            canvas.height = img.naturalHeight || img.height;
            ctx?.drawImage(img, 0, 0);
            canvas.toBlob((blob) => {
                resolve(blob);
            }, 'image/png');
        };
        img.onerror = () => {
            resolve(null);
        };
    });
}
function svgToBlob(svg, scale, fillColor) {
    return new Promise((resolve) => {
        const img = new Image();
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        img.src = `data:image/svg+xml;base64,${Base64.encode(svg)}`;
        img.onload = () => {
            canvas.width = (img.naturalWidth || img.width) * (scale || 2);
            canvas.height = (img.naturalHeight || img.height) * (scale || 2);
            if (ctx) {
                ctx.fillStyle = fillColor || 'white';
                ctx.fillRect(0, 0, canvas.width, canvas.height);
            }
            ctx?.drawImage(img, 0, 0, canvas.width, canvas.height);
            canvas.toBlob((blob) => {
                resolve(blob);
            }, 'image/png');
        };
        img.onerror = () => {
            resolve(null);
        };
    });
}
function svgToDataURI(svg) {
    return `data:image/svg+xml;base64,${Base64.encode(svg)}`;
}
function removeSVGUse(svg) {
    let extract;
    if (typeof svg === 'string') {
        const preview = document.createElement('div');
        preview.innerHTML = svg;
        extract = preview.querySelector('svg');
    }
    else {
        extract = svg;
    }
    let svgHTML = '';
    if (extract) {
        const width = extract.getAttribute('width');
        extract.style.width = width || '';
        const useList = extract.querySelectorAll('use');
        useList.forEach((node) => {
            const href = node.getAttribute('xlink:href');
            if (href) {
                const path = extract.querySelector(href);
                if (path) {
                    const newPath = path.cloneNode(true);
                    newPath.removeAttribute('id');
                    const attributes = node.attributes;
                    const g = document.createElement('g');
                    for (let attr in attributes) {
                        const item = attributes[attr];
                        if (item.name !== 'xlink:href') {
                            g.setAttribute(item.name, item.value);
                        }
                    }
                    g.appendChild(newPath);
                    node.replaceWith(g);
                }
            }
        });
        const defs = extract.querySelector('defs');
        if (defs) {
            defs.remove();
        }
        svgHTML = extract.outerHTML;
    }
    return svgHTML;
}

export { imgURLToBlob, removeSVGUse, svgToBlob, svgToDataURI };
