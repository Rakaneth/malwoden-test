import { Ferocity, Savage } from './egos'

export const CREATURES = {
    wolf: {
        name: "wolf",
        desc: "A large wolf",
        glyph: {
            char: 'w',
            color: [192, 101, 97],
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
            color: [100, 0, 100],
        },
        tags: ["human"],
        egos: {
            10: Savage,
            5: Ferocity,
        },
        freq: 5,
    },
    cultist: {
        name: "cultist",
        desc: "A mysterious, hooded figure",
        glyph: {
            char: '@',
            color: [191, 0, 191]
        },
        tags: ["human", "cult"],
        egos: {
            5: Savage,
        },
        freq: 3
    }
}