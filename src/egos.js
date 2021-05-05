import { Mixin } from './mixin'

const suffixEgos = "ego,suffix,creature-ego";
const prefixEgos = "ego,prefix,creature-ego";

class Race extends Mixin {
    constructor(race, rDesc, data) {
        let i = {
            raceDesc: rDesc,
            raceName: race,
            isRace: true,
            ...data
        }
        super(race, "race", i);
    }
}

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


//racial egos
export const Elf = new Race("elf", "An elf of the Fang Wood", {
    stats: {
        _str: -1,
        _spd: 1,
        _stam: -1,
        _smt: 1
    },
});

export const Wolfborn = new Race("wolfborn", "A wolfborn of the Fang Wood", {
    stats: {
        _str: 1,
        _spd: 1,
        _stam: 1,
        _smt: -1,
        _sag: -1,
        _money: -50,
    },
    scent: 8,
    //TODO: wolf form?
});

export const Dwarf = new Race("dwarf", "A Dvergr from the Mithril Gate", {
    stats: {
        _skl: 1,
        _stam: 1,
        _spd: -1,
        _sag: -2,
        _money: 50,
    },
    darkvision: 10,
})