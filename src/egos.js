import { Mixin } from './mixin'

const suffixEgos = "ego,suffix,creature-ego";
const prefixEgos = "ego,prefix,creature-ego";

export const Savage = new Mixin("savage", prefixEgos, {
    stats: {
        _str: 2,
        _stam: 1,
        _smt: -1,
    },
    isPrefix: true,
})

export const Ferocity = new Mixin("of ferocity", suffixEgos, {
    stats: {
        _spd: 2,
        _stam: 1,
        _sag: -1,
    },
    isSuffix: true,
});