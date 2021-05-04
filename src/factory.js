import { 
    Blocker, 
    Carryable, 
    EquipmentStats, 
    Player, 
    Vision, 
    Equipper, 
    PrimaryStats 
} from "./components";

import { Entity } from './entity';
import { GameManager } from './game';
import { CREATURES } from "./creatures";
import { cloneDeep } from 'lodash';
import { getWeightedItem } from './rng'
import { EQUIPMENT } from "./equipment";

let idCounter = 0;

export const EntityType = {
    PLAYER: {
        layer: 3,
        components: [Player, Blocker, Vision, PrimaryStats, Equipper],
    },
    CREATURE: {
        layer: 2,
        components: [Blocker, Vision, PrimaryStats],
    },
    EQUIP: {
        layer: 1,
        components: [EquipmentStats, Carryable],
    },
    ITEM: {
        layer: 1,
    }
}

function _makeID(name) {
    return `${name}-${idCounter++}`;
}

export function seed(entity, gameMap=GameManager.curMap) {
    const pos = gameMap.getRandomFloor();
    entity.moveTo(pos.x, pos.y, gameMap.id);
    GameManager.addEntity(entity);
}

//we need this because lodash doesn't know how to clone getters,
//which our components make extensive use of
//we need to clone things so that the base templates don't get 
//changed while creating entities.

function deepClone(obj) {
    let base = cloneDeep(obj);
    for (let k in obj) {
        if (typeof(obj[k]) === 'object') {
            base[k] = deepClone(obj[k]);
        }
        const prop = Object.getOwnPropertyDescriptor(obj, k);
        if (prop.get || prop.set) {
            Object.defineProperty(base, k, prop);
        }
    }
    
    return base;
}

export const EntityFactory = {
    makeCreature(buildID, eType, id=null) {
        const template = deepClone(CREATURES[buildID]);
        const creatureID = id || _makeID(buildID)
        const e = new Entity(creatureID, eType.layer, template);
        if (eType.components) {
            for (let c of eType.components) {
                e.applyComponent(c, template);
            }
        }
        return e;
    },

    makeEquip(buildID, eType) {
        const template = deepClone(EQUIPMENT[buildID]);
        const id = _makeID(buildID);
        const e = new Entity(id, eType.layer, template);
        if (eType.components) {
            for (let c of eType.components) {
                e.applyComponents(c, template);
            }
        }
    },

    makePlayer(buildID, playerName, race) {
        const template = deepClone(CREATURES[buildID]);
        template.name = playerName;
        template.desc = "You";
        template.noEgos = true; //no more savage Farin!
        template.money = 100;
        if (race) {
            if (template.components) {
                template.components.push(race);
            } else {
                template.components = [race];
            }
        }
        return this.thingFromTemplate("player", template, EntityType.PLAYER);
    },

    thingFromTemplate(eID, template, eType) {
        const e = new Entity(eID, eType.layer, template);
        const components = eType.components || [];
        for (let c of components) {
            e.applyComponent(c, template);
        }
        return e;
    },

    randomFrom(repo) {
        const [buildID, o] = getWeightedItem(repo, e => e.freq || 0);
        return [buildID, deepClone(o)];
    },

    randomEquipment() {
        const [buildID, o] = this.randomFrom(EQUIPMENT);
        return this.thingFromTemplate(_makeID(buildID), o, EntityType.EQUIP);
    },

    randomCreature() {
        const [buildID, o] = this.randomFrom(CREATURES);
        return this.thingFromTemplate(_makeID(buildID), o, EntityType.CREATURE);
    },

    /*
    randomItem() {
        const [buildID, o] = this.randomFrom(ITEMS);
        return this.thingFromTemplate(buildID, o, EntityType.ITEM);
    },
    */
}