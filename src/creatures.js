import { DoorOpener, Equipper, Inventory } from './components'
import { Ferocity, Savage } from './egos'
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
        vision: 10,
        freq: 10,
    },
    rogue: {
        name: "rogue",
        desc: "A lurking bandit",
        glyph: {
            char: '@',
            color: Swatch.roguePurple,
        },
        tags: ["human"],
        egos: {
            10: Savage,
            5: Ferocity,
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
        tags: ["human", "cult"],
        egos: {
            5: Savage,
        },
        freq: 3
    }
}