import { Util } from 'malwoden';

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
            return Number.MAX_SAFE_INTEGER;
        } 
        
        neis.sort((fst, snd) => this.get(fst) - this.get(snd));
        return this.get(neis[0]);
    }

    scan(...goals) {
        if (goals.length === 0) return;
        let visited = {};
        const visit = (p) => {
            visited[`${p.x},${p.y}`] = true;
        }
        const isDone = (p) => visited[`${p.x},${p.y}`];
        for (let p of goals) {
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