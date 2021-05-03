import {Mixin} from './mixin';
import {GameManager} from './game';
import { remove } from 'lodash'
import { GameRNG } from './rng'

//flags
export const Player = new Mixin("player", "actor");
export const Blocker = new Mixin("blocker", "blocker");
export const Carryable = new Mixin("carryable", "carryable");
export const DoorOpener = new Mixin("doorOpener", "doorOpener");
export const Opaque = new Mixin("opaque", "opaque");

//item attributes
export const MoneyDrop = new Mixin("moneyDrop", "moneyDrop", {
    init(opts) {
        this.amt = GameRNG.nextInt(opts.minCoins, opts.maxCoins);
    }
});

export const Healing = new Mixin("healing", "consumable", {
    init(opts) {
        this.amt = opts.amt;
        this.uses = opts.uses || 1;
        this.usedMessage = opts.usedMessage || '<user> uses <item>';
    },

    consume(user) {
        //TODO: define healing item use
    }
});

//creature attributes
export const Inventory = new Mixin('inventory', 'inventory', {
    init(opts) {
        this._inventory = [];
        this._invCapacity = opts.invCapacity || 2;
        this._money = 0;
    },

    addInventory(eID) {
        this._inventory.push(eID);
    },

    removeInventory(eID) {
        remove(this._inventory, (e) => e === eID);
    },

    get bagsFull() { return this._inventory.length === this._invCapacity; },

    pickUp(itemOrEID) {
        const thing = typeof(itemOrEID) === 'string' ? GameManager.getEntity(itemOrEID) : itemOrEID;
        const canPickUp = thing.has('carryable') || thing.has('moneyDrop');
        if (!this.bagsFull && canPickUp) {
            if (thing.has('moneyDrop')) {
                this._money = thing.amt;
                GameManager.removeEntity(thing);
            } else {
                thing.mapID = null;
                addInventory(thing.id);
            }
        }
    },

    drop(itemOrEID) {
        const thing = typeof(itemOrEID) === 'string' ? GameManager.getEntity(itemOrEID) : itemOrEID;
        this.removeInventory(thing.id);
        thing.moveTo(this.pos.x, this.pos.y, this.mapID);
        if (thing.equipped) {
            thing.equipped = false;
        }
    }

    //TODO Messaging
});

export const Vision = new Mixin('vision', 'vision', {
    init(opts) {
        this._vision = opts.vision || 6;
        this.inView = [];
    },

    get vision() { return this._vision; },

    canSee(ptOrEntity) {
        const pt = ptOrEntity.pos || ptOrEntity;
        const mapDark = GameManager.curMap.dark;
        return !mapDark || this.inView.some(p => p.x === pt.x && p.y === pt.y);
    }
});