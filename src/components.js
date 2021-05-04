import {Mixin} from './mixin';
import {GameManager} from './game';
import { remove } from 'lodash'
import { GameRNG } from './rng'
import { EquipSlots } from './equipslots';

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

    get bagsFull() { 
        if (!this._inventory) return true;
        return this._inventory.length === this._invCapacity; 
    },
    get inventoryItems() {
        if (!this._inventory) return [];
        return this._inventory.map(eID => GameManager.getEntity(eID)) 
    },

    pickUp(itemOrEID) {
        const thing = typeof(itemOrEID) === 'string' ? GameManager.getEntity(itemOrEID) : itemOrEID;
        const canPickUp = thing.has('carryable') || thing.has('moneyDrop');
        if (!this.bagsFull && canPickUp) {
            if (GameManager.playerCanSee(this)) {
                GameManager.addMsg(`${this.name} picks up ${thing.name}`);
            }
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
        if (GameManager.playerCanSee(this)) {
            GameManager.addMsg(`${this.name} drops ${thing.name}.`);
        }
    },

    findInInventory(itemOrEID) {
        const thing = typeof(itemOrEID) === 'string' ? GameManager.getEntity(itemOrEID) : itemOrEID;
        return this._inventory.find(e => thing.id === e.id);
    },

    //TODO Messaging
});

export const Vision = new Mixin('vision', 'vision', {
    init(opts) {
        this._vision = opts.vision || 6;
        this.inView = [];
    },

    canSee(ptOrEntity) {
        const pt = ptOrEntity.pos || ptOrEntity;
        const mapDark = GameManager.curMap.dark;
        return !mapDark || this.inView.some(p => p.x === pt.x && p.y === pt.y);
    }
});

export const PrimaryStats = new Mixin('primaryStats', 'primaryStats', {
    init(opts) {
        this._str = opts.str || 1;
        this._stam = opts.stam || 1;
        this._spd = opts.spd || 1;
        this._skl = opts.skl || 1;
        this._sag = opts.sag || 1;
        this._smt = opts.smt || 1;
    }
})

export const EquipmentStats = new Mixin('equipStats', 'equipStats', {
    init(opts) {
        this.str = opts.str || 0;
        this.skl = opts.skl || 0;
        this.stam = opts.stam || 0;
        this.spd = opts.spd || 0;
        this.sam = opts.sag || 0;
        this.smt = opts.smt || 0;
        this.atp = opts.atp || 0;
        this.dfp = opts.dfp || 0;
        this.tou = opts.tou || 0;
        this.wil = opts.wil || 0;
        this.pwr = opts.pwr || 0;
        this.slot = opts.slot;
        this.vision = opts.vision || 0;
        this.equipped = false;
    }
})

export const Equipper = new Mixin('equipper', 'stats', {
    get allEquipped() {
        if (!this.inventoryItems) return [];
        return this.inventoryItems.filter(item => item.equipped);
    },

    sumOfEquipped(stat) {
        const reduceCB = (acc, item) => acc + (item[stat] || 0);
        return this.allEquipped.reduce(reduceCB, 0);
    },

    get str() { return this._str + this.sumOfEquipped('str'); },
    get stam() { return this._stam + this.sumOfEquipped('stam');},
    get skl() { return this._skl + this.sumOfEquipped('skl'); },
    get spd() { return this._spd + this.sumOfEquipped('spd'); },
    get sag() { return this._sag + this.sumOfEquipped('sag'); },
    get smt() { return this._smt + this.sumOfEquipped('smt'); },

    get atp() { return this._skl + this.sumOfEquipped('atp'); },
    get dfp() { return this._skl + this.sumOfEquipped('dfp'); },
    get tou() { return this._stam + this.sumOfEquipped('tou'); },
    get wil() { return this._sag + this.sumOfEquipped('wil'); },
    get pwr() { return this._smt + this.sumOfEquipped('pwr'); },
    get dmg() { 
        const bonus = this._str + this.sumOfEquipped('dmgBonus');
        let bonusStr = "";
        if (bonus > 0) {
            bonusStr = `+${bonus}`;
        } else if (bonus < 0) {
            bonusStr = `${bonus}`
        };
        let wpnDmg;
        if (this.equippedWeapon) {
            wpnDmg = this.equippedWeapon.dng; 
        } else {
            //TODO basic attacks for monsters
            wpnDmg = "1d2";
        }
        return `${wpnDmg}${bonusStr}`;
    },

    get vision() { 
        const eqVision = this.equippedTorch && this.equippedTorch.vision || 0;
        return Math.max(this._vision, eqVision)
    },

    equip(eID, slot) {
        if (this.findInInventory(eID)) {
            const thing = GameManager.getEntity(eID);
            for (let eq of this.allEquipped) {
                if (eq.slot === slot) eq.equipped = false;
            }
            thing.equipped = true
        }
    },

    getEquipSlot(slot) {
        return this.allEquipped.find(e => e.isEquipped && e.slot === slot);
    },

    get equippedWeapon() { return this.getEquipSlot(EquipSlots.WEAPON); },
    get equippedArmor() { return this.getEquipSlot(EquipSlots.ARMOR); },
    get equippedTrinket() { return this.getEquipSlot(EquipSlots.TRINKET); },
    get equippedTorch() { return this.getEquipSlot(EquipSlots.TORCH); }
});