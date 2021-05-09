import { Util } from 'malwoden';
import { debugPrint } from './gameconfig';

export default class DijkstraMap extends Util.Table {
    constructor(width, height, passableCB, topology = "four") {
        super(width, height);
        this.fill(Number.MAX_SAFE_INTEGER);
        this._passableCB = passableCB;
        this._topology = topology;
    }

    _lowestNeighbor(p) {
        let neis = this.getNeighbors(p, this._passableCB, this._topology);
        if (neis.length === 0) {
            return {point: null, val: Number.MAX_SAFE_INTEGER};
        } 
        
        neis.sort((fst, snd) => this.get(fst) - this.get(snd));
        return {point: neis[0], val: this.get(neis[0])};
    }

    build(...goals) {
        let scanStartTime = new Date();
        this.fill(Number.MAX_SAFE_INTEGER);
        if (goals.length === 0) return;
        let visited = {};
        const visit = (p) => {
            visited[`${p.x},${p.y}`] = true;
        }
        const isDone = (p) => visited[`${p.x},${p.y}`];
        for (let p of goals.filter(g => this._passableCB(g))) {
            this.set(p, 0);
            visit(p);
        }
        let horizon = goals.slice();
        while (horizon.length > 0) {
            let next = horizon.shift();
            let check = this.get(next);
            for (let n of this.getNeighbors(next, this._passableCB, this._topology)) {
                if (isDone(n)) continue;
                if (this.get(n) > check + 1) {
                    this.set(n, check + 1);
                }
                visit(n);
                horizon.push(n);
            }
        }
        let scanEndTime = new Date();
        debugPrint(`Dbuild took ${scanEndTime - scanStartTime} ms`);
    }

    scan (...goals) {
        let scanStartTime = new Date();
        if (!goals || goals.length === 0) return;
        if (!this._items) return;
        this._items.forEach((v) => {if (v === 0) v = Number.MAX_SAFE_INTEGER})
        for (let g of goals) {
            this.set(g, 0);
        }
        
        let changed = true;
        while(changed) {
            changed = false;
            for (let y=0; y<this.height; y++) {
                for (let x=0; x<this.width; x++) {
                    let v = this.get({x, y});
                    let {point, val} = this._lowestNeighbor({x, y});
                    if (point === null) continue;
                    if (v > val + 1) {
                        this.set({x, y}, val + 1);
                        changed = true;
                    }
                }
            }
        }

        let scanEndTime = new Date();
        debugPrint(`Dscan took ${scanEndTime - scanStartTime} ms`);
    }

    toFleeMap() {
        for (let y=0; y<this.height; y++) {
            for (let x=0; x<this.width; x++) {
                if (this._passableCB({x, y})) {
                    this.set({x, y}, this.get({x, y}) * -1.2);
                } 
            }
        }
    }


    print() {
        for (let y=0; y<this.height; y++) {
            let row = "";
            for (let x=0; x<this.width; x++) {
                if (this.get({x, y}) === Number.MAX_SAFE_INTEGER) {
                    row += "#  ";
                } else {
                    row += `${this.get({x, y}).toString()}  `;
                }
            }
            console.log(row);
        }
    }


}