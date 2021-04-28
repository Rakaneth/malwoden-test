import { Mixin } from './mixin'

export const Savage = new Mixin("savage", "ego,prefix,creature-ego", {
    stats: {
        str: 2,
        stam: 1,
        smt: -1,
    },
    isPrefix: true,
})

export const Ferocity = new Mixin("of ferocity", "ego,suffix,creature-ego", {
    stats: {
        spd: 2,
        stam: 1,
        sag: -1,
    },
    isSuffix: true,
});