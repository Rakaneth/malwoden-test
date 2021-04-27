import { Util, FOV, Pathfinding, Terminal, Glyph} from 'malwoden';

export class Tile {
    constructor(glyph, color, walk=true, see=true) {
        this.glyph = glyph;
        this.color = color;
        this.walk = walk;
        this.see = see;
    }
}

const NULL_TILE = new Tile(null, null, false, false);
const WALL_STONE = new Tile(Glyph.fromCharCode(0x23, Terminal.Color.Gray), false, false);
const FLOOR_STONE = new Tile(Glyph.fromCharCode(0x2E, Terminal.Color.Gray));

export class GameMap {
    static TILES = [
        NULL_TILE,
        FLOOR_STONE,
        WALL_STONE,
    ];
    
    constructor(width, height, id, name, dark=false) {
        this._tiles = new Util.Table(width, height);
        this._tiles.fill(2);
        this._id = id;
        this._name = name;
        this._dark = dark;
        this._floors = [];
        this._explored = new Util.Table(width, height);
        this._explored.fill(false);
    }

    get dark() { return this._dark; }
    get id() { return this._id; }
    get name() { return this._name; }
    get width() { return this._tiles.width; }
    get height() { return this._tiles.height; }
    
    inBounds(x, y) {
        return x >= 0 && x < this.width && y >= 0 && y < this.height;
    }
    
    getTile(x, y) {
        if (this.inBounds(x, y)) {
            const idx = this._tiles.get({x, y});
            return GameMap.TILES[idx];
        }

        return GameMap.TILES[0];
    }

    setTile(x, y, tileCode) {
        this._tiles.set({x, y}, tileCode);
        if (tileCode === 2) {
            this._floors.push({x, y});
        } else {
            this._floors = this._floors.filter(e => !(e.x === x && e.y === y));
        }
    }

    isExplored(x, y) {
        return this._explored.get({x, y});
    }

    explore(x, y) {
        this._explored.set({x, y}, true);
    }

    getRandomFloor(rng) {
        return rng.nextItem(this._floors);
    }
}

