import { Rand } from 'malwoden';

export class Game {
    constructor() {
        this._scheduler = {};
        this._entities = {};
        this._maps = {};
        this._curMapId = "none";
        this.rng = new Rand.AleaRNG();
    }

    get curMap() {
        return this._maps[this._curMapId];
    }

    get curEntities() {
        return Object.values(this._entities)
            .filter(e => e.mapID === this._curMapId);
    }

    get player() {
        return this._entities["player"];
    }

    set currentMap(newMap) {
        this._curMapId = newMap;
    }
    
    addMap(m) {
        this._maps[m.id] = m;
    }

    addEntity(entity) {
        this._entities[entity.id] = entity;
    }

    removeEntity(entity) {
        if (typeof(entity) === 'object') {
            delete this._entities[entity.id];
        } else if (typeof(entity) === 'string') {
            delete entities[entity];
        }
    }
}

