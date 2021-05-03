import { Rect } from './utils';
import { GameManager } from './game';
import { MapRNG, pctChance } from './rng';

const MIN_BSP_SIZE = 15;
const MAX_BSP_SIZE = 21;
const MIN_ROOM_SIZE = 5;
const RECT_RATIO = (1 + Math.sqrt(5)) / 2; //golden ratio

function moveAlongX(x1, x2, y, cb) {
    const deltaX = (x2 - x1) 
    const distX = Math.abs(deltaX);
    const incX = distX === 0 ? 0 : deltaX / distX;
    let x = x1;
    while (x !== x2) {
        cb({x, y});
        x += incX;
    }
}

function moveAlongY(y1, y2, x, cb) {
    const deltaY = y2 - y1;
    const distY = Math.abs(deltaY);
    const incY = distY === 0 ? 0 : deltaY / distY;
    let y = y1;
    while (y !== y2) {
        cb({x, y});
        y += incY;
    }
}

function moveAlongCorridor(start, goal, cb) {
    //bendH means the bend itself is horizontal, i.e. vertical corridor
    const bendH = MapRNG.nextBoolean();
    let bendStop;
    if (bendH) {
        bendStop = MapRNG.nextInt(start.y, goal.y);
        moveAlongY(start.y, bendStop, start.x, cb);
        moveAlongY(bendStop, goal.y, goal.x, cb);
        moveAlongX(start.x, goal.x, bendStop, cb);
    } else {
        bendStop = MapRNG.nextInt(start.x, goal.x);
        moveAlongX(start.x, bendStop, start.y, cb);
        moveAlongX(bendStop, goal.x, goal.y, cb);
        moveAlongY(start.y, goal.y, bendStop, cb);
    }
}

export class BSPNode extends Rect {
    constructor(x, y, w, h) {
        super(x, y, w, h);
        this.room = null;
        this.left = null;
        this.right = null;
        this.path = {};
        this._link = null;
    }

    split() {
        if (!(this.left === null && this.right === null)) {
            return false;
        }
        let splitH = MapRNG.nextBoolean();
        const w = this.width;
        const h = this.height;
        
        if (w > h && w / h > RECT_RATIO) {
            splitH = false;
        } else if (h > w && h / w > RECT_RATIO) {
            splitH = true;
        }

        const max = (splitH ? h : w) - MIN_BSP_SIZE;
        if (max < MIN_BSP_SIZE) {
            return false;
        }

        const s = MapRNG.nextInt(MIN_BSP_SIZE, max);
        let rect;
        if (splitH) {
            this.left = new BSPNode(this.x, this.y, this.width, s);
            this.right = new BSPNode(this.x, this.y+s, this.width, this.height - s);
        } else {
            this.left = new BSPNode(this.x, this.y, s, this.height);
            this.right = new BSPNode(this.x + s, this.y, this.width - s, this.height);
        }

        return true;
    }

    get shouldSplit() { 
        return this.width > MAX_BSP_SIZE || this.height > MAX_BSP_SIZE;
    }

    findRoom() {
        if (this.room) {
            return this.room;
        }

        let lRoom;
        let rRoom;

        if (this.left) {
            lRoom = this.left.findRoom();
        }

        if (this.right) {
            rRoom = this.right.findRoom();
        }

        if (!(lRoom || rRoom)) {
            return null;
        } else if (!rRoom) {
            return lRoom;
        } else if (!lRoom) {
            return rRoom;
        } else if (MapRNG.nextBoolean()) {
            return rRoom;
        } else {
            return lRoom;
        }
    }

    get isLeaf() { return !(this.left && this.right); }

    get link() {
        if (!this._link) {
            if (this.room) {
                const linkX = MapRNG.nextInt(this.room.x1, this.room.x2);
                const linkY = MapRNG.nextInt(this.room.y1, this.room.y2);
                this._link = {x: linkX, y: linkY};
            } else {
                const cands = Object.values(this.path);
                this._link = MapRNG.nextItem(cands);
            }
        }

        return this._link;
    }

    makeRooms() {
        if (this.left) {
            this.left.makeRooms();
        }

        if (this.right) {
            this.right.makeRooms();
        }

        if (this.isLeaf) {
            let roomW = MapRNG.nextInt(MIN_ROOM_SIZE, this.width - 2);
            let roomH = MapRNG.nextInt(MIN_ROOM_SIZE, this.height - 2);
            let roomX = MapRNG.nextInt(1, this.width - roomW - 1);
            let roomY = MapRNG.nextInt(1, this.height - roomH - 1);
    
            this.room = new Rect(this.x + roomX, this.y + roomY, roomW, roomH);
        } else {
            const cb = (pos) => {
                const idx = `${pos.x},${pos.y}`;
                this.path[idx] = pos;
            }
            if (this.left.link && this.right.link) {
                moveAlongCorridor(this.left.link, this.right.link, cb);
            }
        }
    }
}



export function bspSplit(rootNode) {
    const results = [rootNode];
    let didSplit = true;
    while (didSplit) {
        didSplit = false;
        for (let node of results) {
            if (node.left === null && node.right === null) {
                if (node.shouldSplit || pctChance(35)) {
                    if (node.split()) {
                        results.push(node.left);
                        results.push(node.right);
                        didSplit = true;
                    }
                }
            }
        }
    }
    return results;
}

export function inOrder(bspRoot, fn) {
    if (bspRoot.left) {
        inOrder(bspRoot.left, fn);
    }

    fn(bspRoot);

    if (bspRoot.right) {
        inOrder(bspRoot.right, fn);
    }
}