import { Rand } from 'malwoden';

class Game {
    constructor() {
        this._scheduler = {};
        this._entities = {};
        this._maps = {};
        this._curMapId = "none";
        this._rng = new Rand.AleaRNG();
    }

    get rng() { return this._rng; }

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

    set curMap(newMapId) {
        this._curMapId = newMapId;
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

    getEntitiesAt(point, mapID) {
        if (mapID == null) {
            mapID = this._curMapId;
        }
        const pred = (e) => e.isAt(point, mapID);
        return Object.values(this._entities).filter(pred);
    }

    getBlockerAt(point, mapID) {
        if (mapID == null) {
            mapID = this._curMapId;
        }
        const pred = (e) => e.isAt(point, mapID) && e.has('blocker');
        return Object.values(this._entities).find(pred);
    }

    pctChance(pct) {
        return this.rng.nextInt(0, 99) < pct;
    }

    weightedItem(tbl, weightFn) {
        const sum = Object.values(tbl)
            .reduce((a, b) => weightFn(a) + weightFn(b), 0);
        const roll = this._rng.nextInt(0, sum-1);
        let acc = 0;
        for (let k in tbl) {
            let o = tbl[k];
            acc += weightFn(o);
            if (roll < acc) {
                return [k, o];
            }
        }
    }
}

export const GameManager = new Game();
