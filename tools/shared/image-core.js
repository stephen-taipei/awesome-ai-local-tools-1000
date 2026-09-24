/* Pure image operations, independent of models and DOM. */
(function (root) {
    'use strict';
    function toRGBA(data, width, height, channels) {
        if (![1, 2, 3, 4].includes(channels) || !Number.isInteger(width) || !Number.isInteger(height) || width < 1 || height < 1 || width * height > 4096 * 4096 || data.length !== width * height * channels) throw new Error('Invalid image dimensions or channel layout.');
        const out = new Uint8ClampedArray(width * height * 4);
        for (let p = 0; p < width * height; p++) {
            const s = p * channels, d = p * 4;
            out[d] = data[s];
            out[d + 1] = channels <= 2 ? data[s] : data[s + 1];
            out[d + 2] = channels <= 2 ? data[s] : data[s + 2];
            out[d + 3] = channels === 2 ? data[s + 1] : channels === 4 ? data[s + 3] : 255;
        }
        return out;
    }
    function applyMask(rgba, mask) {
        if (rgba.length !== mask.length || rgba.length % 4) throw new Error('Mask size mismatch.');
        const result = new Uint8ClampedArray(rgba);
        for (let i = 0; i < result.length; i += 4) result[i + 3] = Math.round(result[i + 3] * mask[i] / 255);
        return result;
    }
    const api = Object.freeze({ toRGBA, applyMask });
    root.ImageCore = api;
    if (typeof module !== 'undefined') module.exports = api;
})(globalThis);
