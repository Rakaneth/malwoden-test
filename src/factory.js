import { Blocker, Player, Vision } from "./components";
import { Entity } from './entity';
import { GameManager } from './game';
import { CREATURES } from "./creatures";
import { cloneDeep } from 'lodash';

let idCounter = 0;

export const EntityType = {
    PLAYER: {
        layer: 3,
        components: [Player, Blocker, Vision] //TODO: Vision
    },
    CREATURE: {
        layer: 2,
        components: [Blocker, Vision] //TODO: Vision
    },
    ITEM: {
        layer: 1,
    }
}

function _makeID(name) {
    return `${name}-${idCounter++}`;
}

export function seed(gameMap, entity) {
    const pos = gameMap.getRandomFloor(GameManager.rng);
    entity.moveTo(pos.x, pos.y, gameMap.id);
    GameManager.addEntity(entity);
}

export const EntityFactory = {
    makeCreature(buildID, eType, id=null) {
        const template = cloneDeep(CREATURES[buildID]);
        const creatureID = id || _makeID(buildID)
        const e = new Entity(creatureID, eType.layer, template);
        if (eType.components) {
            for (let c of eType.components) {
                e.applyComponent(c, template);
            }
        }
        return e;
    },

    makePlayer(buildID, playerName, playerDesc) {
        const template = cloneDeep(CREATURES[buildID]);
        template.name = playerName;
        template.desc = playerDesc;
        return this.makeCreature(buildID, EntityType.PLAYER, "player");
    },

    randomCreature() {
        const buildID = cloneDeep(this._randomTemplateFrom(CREATURES));
        return this.makeCreature(buildID, EntityType.CREATURE);
    },

    _randomTemplateFrom(repo) {
        const [buildID, _] = GameManager.weightedItem(repo, (t) => t.freq || 0);
        return buildID;
    }
}