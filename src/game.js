import { Rand } from 'malwoden';
import { Scheduler } from './scheduler';
import { wrap } from './utils';

class Game {
    constructor() {
        this._scheduler = null;
        this._entities = {};
        this._maps = {};
        this._curMapId = "none";
        this._msgs = [];
        this._currentTurn = 0;
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

    get lastMsg() {
        return this._msgs[this._msgs.length-1];
    }

    get msgs() {
        return this._msgs;
    }

    set curMap(newMapId) {
        this._curMapId = newMapId;
        const pred = (e) => e.has('actor');
        const toSched = this.curEntities.filter(pred);
        this._scheduler = new Scheduler(toSched, this._currentTurn);
        this.curMap.dMap.scan(this.player.pos);
    }

    addMap(m) {
        this._maps[m.id] = m;
    }

    addEntity(entity) {
        this._entities[entity.id] = entity;
        if (entity.has('actor') && entity.mapID === this._curMapId) {
            this._scheduler.add(entity, this.currentTurn);
        }
    }

    addMsg(msg) {
        this._msgs.push(msg);
    }

    removeEntity(entity) {
        this._scheduler.remove(entity);
        delete this._entities[entity.id];
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

    updateFOV() {
        this.curMap.updateFOV(this.player);
    }

    playerCanSee(pointOrEntity) {
        return this.player.canSee(pointOrEntity);
    }

    update() {
        this._scheduler.update();
        this._currentTurn = this._scheduler._currentTurn;
    }

    get currentTurn() { return this._scheduler.currentTurn; }
}

export const GameManager = new Game();
