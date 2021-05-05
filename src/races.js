import Mixin from './mixin';

class Race extends Mixin {
    constructor(race, hpMult, rDesc, data) {
        let i = {
            raceDesc: rDesc,
            raceName: race,
            isRace: true,
            _raceHPMult: hpMult,
            ...data
        }
        super(race, "race", 2, i);
    }
}

//racial egos
export const Elf = new Race("elf", 4, "An elf of the Fang Wood", {
    stats: {
        _str: -1,
        _spd: 1,
        _stam: -1,
        _smt: 1
    },
});

export const Wolfborn = new Race("wolfborn", 7, "A wolfborn of the Fang Wood", {
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

export const Dwarf = new Race("dwarf", 6, "A Dvergr from the Mithril Gate", {
    stats: {
        _skl: 1,
        _stam: 1,
        _spd: -1,
        _sag: -2,
        _money: 50,
    },
    darkvision: 10,
})