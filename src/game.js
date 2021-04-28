import { Rand } from 'malwoden';

class Game {
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

    set curMap(newMap) {
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
            delete this._entities[entity];
        }
    }

    getEntitiesAt(x, y, mapID) {
        if (mapID == null) {
            mapID = this._curMapId;
        }
        const pred = (e) => {
            return e.pos.x === x && e.pos.y === y && e.mapID === mapID;
        };
        return Object.values(this._entities).filter(pred);
    }

    pctChance(pct) {
        return this.rng.nextInt(0, 99) < pct;
    }
}

export const GameManager = new Game();
