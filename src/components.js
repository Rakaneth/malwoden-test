import {Mixin} from './mixin';
import {GameManager} from './game';

//flags
export const Player = new Mixin("player", "actor");
export const Blocker = new Mixin("blocker", "blocker");
export const Carryable = new Mixin("carryable", "carryable");
export const DoorOpener = new Mixin("doorOpener", "doorOpener");

//item attributes
export const MoneyDrop = new Mixin("moneyDrop", "moneyDrop", {
    init(opts) {
        this.amt = GameManager.rng.nextInt(opts.minCoins, opts.maxCoins);
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

//stat-based attributes (players, equipmen