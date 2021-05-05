import Mixin from './mixin';
import {GameManager} from './game';
import { remove } from 'lodash'
import { GameRNG } from './rng'
import { EquipSlots } from './equipslots';
import { clamp } from './utils';

//flags
export const Blocker = new Mixin("blocker", "blocker");
export const Carryable = new Mixin("carryable", "carryable");
export const DoorOpener = new Mixin("doorOpener", "doorOpener");
export const Opaque = new Mixin("opaque", "opaque");

//item attributes
export const MoneyDrop = new Mixin("moneyDrop", "moneyDrop", 1, {
    init(opts) {
        this.amt = GameRNG.nextInt(opts.minCoins, opts.maxCoins);
    }
});

export const Healing = new Mixin("healing", "consumable", 1, {
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
export const Inventory = new Mixin('inventory', 'inventory', 1, {
    init(opts) {
        this._inventory = [];
        this._invCapacity = opts.invCapacity || 2;
        this._money = opts.money || 0;
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
    get money() { return this._money; },

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

export const Vision = new Mixin('vision', 'vision', 1, {
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

export const PrimaryStats = new Mixin('primaryStats', 'primaryStats', 1, {
    init(opts) {
        this._str = opts.str || 1;
        this._stam = opts.stam || 1;
        this._spd = opts.spd || 1;
        this._skl = opts.skl || 1;
        this._sag = opts.sag || 1;
        this._smt = opts.smt || 1;
    }
})

export const EquipmentStats = new Mixin('equipStats', 'equipStats', 1, {
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

export const Equipper = new Mixin('equipper', 'combatStats', 2, {
    init(opts) {
        this._dmg = opts.dmg || "1d2";
    },
    
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
        let bonus = this._str + this.sumOfEquipped('dmgBonus');
        let bonusStr = "";
        let base = "";
        let wpnDmg;
        if (this.equippedWeapon) {
            wpnDmg = this.equippedWeapon.dmg; 
        } else {
            //TODO basic attacks for monsters
            wpnDmg = this._dmg;
        }
        const dmgBonusEx = /(?<base>\d*d\d+)(?<bonus>(?:\+|\-)\d+)?/ig;
        const diceMatch = dmgBonusEx.exec(wpnDmg);
        if (diceMatch) {
            base = diceMatch.groups.base;
            if (diceMatch.groups.bonus) {
                bonus += parseInt(diceMatch.groups.bonus);
            }
        }
        if (bonus > 0) {
            bonusStr = `+${bonus}`;
        } else if (bonus < 0) {
            bonusStr = `${bonus}`
        };
        return `${base}${bonusStr}`;
    },

    get vision() { 
        const eqVision = this.equippedTorch && this.equippedTorch.vision || 0;
        if (GameManager.curMap.dark && this.darkvision) {
            //light sources don't help when not dark
            return Math.max(this.darkvision, eqVision);
        }
        return this._vision; 
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

export const SecondaryStats = new Mixin("combatStats", "combatStats", 2, {
    init(opts) {
        this._atp = opts.atp || 0;
        this._dfp = opts.dfp || 0;
        this._tou = opts.tou || 0;
        this._wil = opts.wil || 0;
        this._pwr = opts.pwr || 0;
        this._dmg = opts.dmg || "1d2";
    },
    
    get str() { return this._str; },   
    get stam() { return this._stam; },
    get spd() { return this._spd; },
    get skl() { return this._skl; },
    get sag() { return this._sag; },
    get smt() { return this._smt; },

    get atp() { return this._skl + this._atp; },
    get dfp() { return this._skl + this._dfp; },
    get tou() { return this._stam + this._tou; },
    get wil() { return this._wil + this._wil; },
    get pwr() { return this._smt + this._pwr; },
    get dmg() { 
        let bonus = this._str;
        const dmgBonusEx = /(?<base>\d*d\d+)(?<bonus>(?:\+|\-)\d+)?/ig;
        const diceMatch = dmgBonusEx.exec(this._dmg);
        let baseDice;
        if (diceMatch)  {
            if (diceMatch.bonus) {
                bonus += parseInt(diceMatch.groups.bonus);
            }

            baseDice = diceMatch.groups.base;
        }
        let bonusStr = "";
        if (bonus > 0) {
            bonusStr = `+${bonus}`;
        } else if (bonus < 0) {
            bonusStr = `${bonus}`;
        }
        return `${baseDice}${bonusStr}`
    },

    get vision() {
        if (GameManager.curMap.dark) {
            return this._darkvision;
        } else {
            return this._vision;
        }
    }
});

export const Actor = new Mixin('actor', 'actor', 1, {
    init(opts) {
        this._ai = opts.ai || "hunt";
    },
    getNextAction() {
        //TODO: AI
    }
});

export const Player = new Mixin("player", "actor", 1, {
    init(opts) {
        this._action = null;
    },
    getNextAction() { return this._action; },
    clearAction() { this._action = null; }
});

export const Vitals = new Mixin("vitals", "vitals", 4, {
    init(opts) {
        this._HPMult = opts.hpMult || 5;
    },

    get maxHP() {
        const mult = this._raceHPMult || this._HPMult;
        return this.stam * mult;
    },

    get alive() { return this._hp > 0; },
    get hpPct() { return this._hp / this.maxHP; },
    get HP() { return this._hp; },
    
    changeHP(amt) {
        this._hp = clamp(this._hp + amt, 0, this.maxHP);
    },

    resolve(entity, opts) {
        entity._hp = entity.maxHP;
    }
})
