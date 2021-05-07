import { debugPrint } from './gameconfig';

const queueCB = (fst, snd) => fst.tick - snd.tick;

export class Scheduler {
    constructor(entities, startTurn) {
        this._queue = [];
        for (let e of entities) {
            this.add(e, 1 + startTurn  - (e.spd / 100));
        }
        this._currentTurn = startTurn;
    }

    add(entity, tick) {
        let t = tick;
        if (t < this.currentTurn) {
            const fractionalTurn = tick - Math.floor(t);
            t += this.currentTurn + fractionalTurn;
        }
        this._queue.push({actor: entity, tick: t});
        this._queue.sort(queueCB);
    }

    remove(entity) {
        this._queue = this._queue.filter(e => e.actor.id !== entity.id);
        this._queue.sort(queueCB);
    }

    get next() {return this._queue[0]; }

    update() {
        let action;
        while(true) {
            let n = this.next;
            this._currentTurn = Math.floor(n.tick);
            action = n.actor.getNextAction();
            if (action) {
                debugPrint(`${n.actor.name} acts on ${n.tick}`, "UPDATE");
                const cost = action();
                n.tick += cost;
                this._queue.sort(queueCB);
                if (n.actor.has('player')) {
                    n.actor.clearAction();
                }
            } else {
                break;
            }
        } 
    }

    get currentTurn() {
        return this._currentTurn || 0;
    }
}