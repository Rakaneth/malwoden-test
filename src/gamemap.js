import { Util, FOV, Terminal, Glyph, Generation} from 'malwoden';
import { BSPNode, bspSplit, inOrder } from './bsp';
import { MapRNG } from './rng';

export class Tile {
    constructor(glyph, walk=true, see=true) {
        this.glyph = glyph;
        this.walk = walk;
        this.see = see;
    }
}

const NULL_TILE = new Tile(null, false, false);
const WALL_STONE = new Tile(Glyph.fromCharCode(0x23, Terminal.Color.Gray), false, false);
const FLOOR_STONE = new Tile(Glyph.fromCharCode(0x2E, Terminal.Color.Gray));
const WATER_DEEP = new Tile(Glyph.fromCharCode(0x7E, Terminal.Color.White, Terminal.Color.Blue), false, true);

export class GameMap {
    static TILES = [
        NULL_TILE,
        FLOOR_STONE,
        WALL_STONE,
        WATER_DEEP
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
        const fovCB = this.isTransparent.bind(this);
        const fovOptions = {
            topology: "four",
            lightPasses: fovCB,
        };
        this._fov = new FOV.PreciseShadowcasting(fovOptions);
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

    isWall(p) {
        const wallTiles = [2];
        return wallTiles.includes(this._tiles.get(p));
    }

    isExplored(p) {
        return this._explored.get(p);
    }

    explore(p) {
        this._explored.set(p, true);
    }

    getRandomFloor() {
        return MapRNG.nextItem(this._floors);
    }

    isWalkable(p) {
        const t = this.getTile(p);
        return t.walk;
    }

    isTransparent(p) {
        const t = this.getTile(p);
        return t.see;
    }

    updateFOV(entity) {
        entity.inView = [];
        const cb = (pos, range, vis) => {
            if (vis > 0 && this.inBounds(pos)) {
                entity.inView.push(pos);
                if (entity.has('player')) {
                    this.explore(pos);
                }
            }
        }
        this._fov.calculateCallback(entity.pos, entity.vision, cb);
    }

    carve(rect) {
        for (let y=rect.y; y<=rect.y2; y++) {
            for (let x=rect.x; x<=rect.x2; x++) {
                this.setTile({x, y}, 1);
            }
        }
    }

    idx(pt) {
        return pt.y * this.width + pt.x;
    }

    deIdx(idx) {
        return {
            x: idx % this.width,
            y: Math.floor(idx / this.width)
        };
    }

    carveIdx(idx) {
        const pt = this.deIdx(idx);
        this.setTile(pt, 1);
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

    /**
     * Adds water to a map using Drunkard's Walk.
     * @param {GameMap} gameMap The `GameMap` to add water to.
     * @param {*} waterOpts Water config options.
     * @param {number} waterOpts.maxPools The maximum number of pools to generate. Defaults to 3.
     * @param {number} waterOpts.maxPoolSize The max size, in individual tiles,
     * of a single pool. Defaults to 25.
     */
    _addWater(gameMap, waterOpts) {
        const opts = waterOpts || {
            maxPools: 3,
            maxPoolSize: 25,
        };

        const maxPools = opts.maxPools || 3;
        const maxPoolSize = opts.maxPoolSize || 25;
        const numIterations = MapRNG.nextInt(1, maxPools);

        for (let i=0; i<numIterations; i++) {
            const gen = new Generation.DrunkardsWalk({
                width: gameMap.width,
                height: gameMap.height,
                rng: MapRNG,
                topology: "four"
            });
            const walkStart = gameMap.getRandomFloor();
            gen.walkSteps({
                start: walkStart,
                maxCoveredTiles: maxPoolSize,
                steps: Infinity,
            });
            const filled = gen.table.floodFillSelect(walkStart, 1);
            for (let p of filled) {
                gameMap.setTile(p, 3);
            }
        }
    },

    drunkWalk(width, height, id, name, dark) {
        const gameMap = new GameMap(width, height, id, name, dark);
        const gen = new Generation.DrunkardsWalk({
            width: gameMap.width,
            height: gameMap.height,
            rng: MapRNG,
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
        this._addWater(gameMap);

        return gameMap;
    },

    bsp(width, height, id, name, dark) {
        const gameMap = new GameMap(width, height, id, name, dark);

        //leave room for wall edge
        const root = new BSPNode(1, 1, width-2, height-2);
        const tree = bspSplit(root);

        root.makeRooms();

        const cb = (bspNode) => {
            if (bspNode) {
                if (bspNode.room) {
                    gameMap.carve(bspNode.room);
                } else {
                    for (let step of Object.values(bspNode.path)) {
                        gameMap.setTile(step, 1);
                    }
                }
            }
        };

        inOrder(root, cb);
        
        return gameMap;
    }
}

