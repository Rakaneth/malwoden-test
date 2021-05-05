
const queueCB = (fst, snd) => fst.tick - snd.tick;

export class Scheduler {
    constructor(entities) {
        this._queue = [];
        for (let e of entities) {
            this.add(e, 1 - (e.spd / 100));
        }
    }

    add(entity, tick) {
        this._queue.push({actor: entity, tick});
        this._queue.sort(queueCB);
    }

    remove(entity) {
        this._queue = this._queue.filter(e => e.actor.id !== entity.id);
        this._queue.sort(queueCB);
    }

    get next() {return this._queue[0]; }

    update() {
        let action;
        do {
            let n = this.next;
            action = n.actor.getNextAction();
            if (action) {
                const cost = action();
                n.tick += cost;
                this._queue.sort(queueCB);
            }
        } while (action);
    }
}