import { DoorOpener, Equipper, Inventory, SecondaryStats } from './components'
import { Dwarf, Elf, Ferocity, Savage } from './egos'
import { Swatch } from './swatch';

export const CREATURES = {
    wolf: {
        name: "wolf",
        desc: "A large wolf",
        glyph: {
            char: 'w',
            color: Swatch.wolfBrown,
        },
        tags: ["wolf", "animal"],
        egos: {
            75: Savage,
            45: Ferocity,
        },
        vision: 6,
        freq: 10,
        scent: 10,
        dmg: "1d3+1",
        components: [SecondaryStats],
    },
    rogue: {
        name: "rogue",
        desc: "A lurking bandit",
        glyph: {
            char: '@',
            color: Swatch.roguePurple,
        },
        tags: ["humanoid"],
        egos: {
            20: Dwarf,
            15: Elf,
        },
        freq: 5,
        components: [DoorOpener, Equipper, Inventory],
    },
    cultist: {
        name: "cultist",
        desc: "A mysterious, hooded figure",
        glyph: {
            char: '@',
            color: Swatch.cultistPurple,
        },
        tags: ["humanoid", "cult"],
        egos: {
            15: Elf,
            20: Dwarf,
        },
        freq: 3
    },
}