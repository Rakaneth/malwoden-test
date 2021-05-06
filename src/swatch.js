import { Color } from "malwoden";

export const Swatch = {
    wolfBrown: [128, 101, 97],
    cultistPurple: [191, 0, 191],
    roguePurple: [100, 0, 100],
    ironMetal: [57, 57, 57],
    statGreen: [0xBF, 0xFF, 0],
    fireOrange: [0xFF, 0x45, 0],

    toColor(ary) {
        const [r, g, b] = ary;
        return new Color(r, g, b);
    }
}