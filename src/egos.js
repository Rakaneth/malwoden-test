import Mixin from './mixin'

const suffixEgos = "ego,suffix,creature-ego";
const prefixEgos = "ego,prefix,creature-ego";

class Ego extends Mixin {
    constructor(name, isPrefix, data) {
        const egoGroup = isPrefix ? prefixEgos : suffixEgos;
        let i = {...data};
        if (isPrefix) {
            i.isPrefix = true;
        } else {
            i.isSuffix = true;
        }
        super(name, egoGroup, 5, i);
    }
}

//creature egos
export const Savage = new Ego("savage", true, {
    stats: {
        _str: 2,
        _stam: 1,
        _smt: -1,
        _HPMult: 0.5,
    },
});

export const Ferocity = new Ego("of ferocity", false, {
    stats: {
        _spd: 2,
        _stam: 1,
        _sag: -1,
    },
});

export const Hardy = new Ego("hardy", true, {
    stats: {
        _stam: 2,
        _HPMult: 1
    }
});