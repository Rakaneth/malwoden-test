import { Blocker } from "./components";
import { Entity } from './entity';
import { GameManager } from './game';

const CREATURES = {
    wolf: {
        name: "wolf",
        desc: "A large wolf",
        glyph: {
            char: 'w',
            color: [192, 101, 97],
        },
        components: [Blocker],
        tags: ["wolf", "animal"],
    },
    rogue: {
        name: "rogue",
        desc: "A lurking bandit",
        glyph: {
            char: '@',
            color: [191, 0, 191],
        },
        components: [Blocker],
        tags: ["human"],
    }
}

let idCounter = 0;

function _makeID(name) {
    return `${name}-${idCounter++}`;
}

export function seed(gameMap, entity) {
    const pos = gameMap.getRandomFloor(GameManager.rng);
    entity.moveTo(pos.x, pos.y, gameMap.id);
    GameManager.addEntity(entity);
}

export const EntityFactory = {
    makeCreature(creatureID) {
        const template = CREATURES[creatureID];
        return new Entity(_makeID(creatureID), 2, template);
    },
}