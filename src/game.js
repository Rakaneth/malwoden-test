import { Rand } from 'malwoden';
import { wrap } from './utils';

class Game {
    constructor() {
        this._scheduler = {};
        this._entities = {};
        this._maps = {};
        this._curMapId = "none";
        this._rng = new Rand.AleaRNG();
        this._msgs = [];
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

    get lastMsg() {
        return this._msgs[this._msgs.length-1];
    }

    get msgs() {
        return this._msgs;
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

    addMsg(msg) {
        const msgAry = wrap(msg, 50);
        this._msgs.push(msgAry);
    }

    removeEntity(entity) {
        if (typeof(entity) === 'object') {
            delete this._entities[entity.id];
        } else if (typeof(entity) === 'string') {
            delete this._entities[entity];
        }
    }

    getEntity(eID) { return this._entities[eID]; }

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

    updateFOV() {
        this.curMap.updateFOV(this.player);
    }

    
}

export const GameManager = new Game();
