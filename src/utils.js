/**
 * Clamps a value within a range.
 * @param {number} val - the value
 * @param {number} low - lower bound of the range. 
 * @param {number} high - upper bound of the range.
 * @returns {number} `val` if it is within the range;
 * `low` if `val` is less than low, `high` if val is greater than high
 */
export function clamp(val, low, high) {
    return Math.max(low, Math.min(val, high));
}

export class Rect {
    constructor(x, y, w, h) {
        this.x1 = x;
        this.y1 = y;
        this.x2 = x + w - 1;
        this.y2 = y + h - 1;
    }

    get x() { return this.x1; }
    get y() { return this.y1; }
    get width() { return this.x2 - this.x1 + 1; }
    get height() { return this.y2 - this.y1 + 1; }
    get center() { return {
        x: Math.floor((this.x2 - this.x1) / 2),
        y: Math.floor((this.y2 - this.y1) / 2),
    }}

    /**
     * Checks if this `Rect` intersects `other`.
     * @param {Rect} other The `Rect` to check.
     * @returns {boolean} `true` if `other` intersects with `this`, 
     * `false` otherwise.
     */
    intersect(other) {
        return !(this.x1 > other.x2 
            || this.x2 > other.x1 
            || this.y1 > other.y2 
            || this.y2 > other.y1);
    }
}

/**
 * Chops `s` into an array of strings no longer than `maxLength`
 * @param {string} s 
 * @param {number} maxLength 
 * @returns {Array<string>} an array of strings no longer than `maxLength`
 */
export function wrap(s, maxLength) {
    const result = [];
    let curLine = "";
    const words = s.split(/\s+/);
    for (let word of words) {
        if (word.length + curLine.length > maxLength) {
            result.push(curLine.trim());
            curLine = `${word} `;
        } else {
            curLine += `${word} `;
        }
    }

    if (curLine.length > 0) {
        result.push(curLine.trim());
    }
    return result;
}

/**
 * Clips `s` to a maximum length of `maxLength` characters.
 * @param {string} s 
 * @param {number} maxLength 
 * @returns string The clipped string.
 */
export function clip(s, maxLength) {
    return wrap(s, maxLength)[0];
}
