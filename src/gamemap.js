import { Util, FOV, Pathfinding, Terminal, Glyph, Generation} from 'malwoden';
import { GameManager } from './game';

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

    isWalkable(x, y) {
        const t = this.getTile(x, y);
        return t.walk;
    }

    isTransparent(x, y) {
        const t = this.getTile(x, y);
        return t.see;
    }
}

export const MapFactory = {
    _wallBounds(gameMap) {
        for(let x=0; x<gameMap.width; x++) {
            gameMap.setTile(x, 0, 2);
            gameMap.setTile(x, gameMap.height-1, 2);
        }

        for (let y=0; y<gameMap.height; y++) {
            gameMap.setTile(0, y, 2);
            gameMap.setTile(gameMap.width-1, y, 2);
        }
    },

    drunkWalk(width, height, id, name, dark) {
        const gameMap = new GameMap(width, height, id, name, dark);
        const gen = new Generation.DrunkardsWalk({
            width: gameMap.width,
            height: gameMap.height,
            rng: GameManager.rng,
            topology: "four"
        });

        gen.walkSteps({
            start: {x: Math.floor(width/2), y: Math.floor(height/2)},
            steps: Infinity, 
            maxCoveredTiles: Math.floor(width * height * 0.4),
        });

        for (let x=0; x<gen.table.width; x++) {
            for (let y=0; y<gen.table.height; y++) {
                if (gen.table.get({x, y}) === 1) {
                    gameMap.setTile(x, y, 1);
                } else {
                    gameMap.setTile(x, y, 2);
                }
            }
        }

        this._wallBounds(gameMap);

        return gameMap;
    }
}

