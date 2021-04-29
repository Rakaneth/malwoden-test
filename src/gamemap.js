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
    
    inBounds(p) {
        return p.x >= 0 && p.x < this.width && p.y >= 0 && p.y < this.height;
    }
    
    getTile(p) {
        if (this.inBounds(p)) {
            const idx = this._tiles.get(p);
            return GameMap.TILES[idx];
        }

        return GameMap.TILES[0];
    }

    setTile(p, tileCode) {
        this._tiles.set(p, tileCode);
        if (tileCode === 1) {
            this._floors.push(p);
        } else {
            this._floors = this._floors.filter(e => !(e.x === p.x && e.y === p.y));
        }
    }

    isExplored(p) {
        return this._explored.get(p);
    }

    explore(p) {
        this._explored.set(p, true);
    }

    getRandomFloor(rng) {
        return rng.nextItem(this._floors);
    }

    isWalkable(p) {
        const t = this.getTile(p);
        return t.walk;
    }

    isTransparent(p) {
        const t = this.getTile(p);
        return t.see;
    }
}

export const MapFactory = {
    _wallBounds(gameMap) {
        for(let x=0; x<gameMap.width; x++) {
            gameMap.setTile({x, y:0}, 2);
            gameMap.setTile({x, y:gameMap.height-1}, 2);
        }

        for (let y=0; y<gameMap.height; y++) {
            gameMap.setTile({x: 0, y}, 2);
            gameMap.setTile({x: gameMap.width-1, y}, 2);
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

        let p;

        for (let x=0; x<gen.table.width; x++) {
            for (let y=0; y<gen.table.height; y++) {
                p = {x, y};
                if (gen.table.get(p) === 1) {
                    gameMap.setTile(p, 1);
                } else {
                    gameMap.setTile(p, 2);
                }
            }
        }

        this._wallBounds(gameMap);

        return gameMap;
    }
}

