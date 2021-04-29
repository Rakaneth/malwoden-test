import { Color, Glyph, Input } from 'malwoden';
import { GameManager } from './game';
import { GameMap } from './gamemap';
import { clamp } from './utils';

export class Screen {
    constructor(name, rootTeminal) {
        this._name = name;
        this._terminal = rootTeminal;
    }

    get name() { return this._name; }

    render() {
        this._terminal.clear();
        this._onRender();
        this._terminal.render();
    }

    _onRender() {
        throw new Error(`Screen ${this._name} has not implemented a render function`);
    }

    get keyboardContext() {
        throw new Error(`Screen ${this._name} has not implemented a keyboard context`);
    }

    renderCB(fn, ...args) {
        const that = this;
        return function() {
            fn(...args);
            GameManager.updateFOV();
            that.render();
        }
    }
}

const MAP_W = 50;
const MAP_H = 30;

function calc(p, m, s) {
    return clamp(p - Math.floor(s/2), 0, Math.max(0, m-s));
}



export class MainScreen extends Screen {
    
    constructor(rootTerminal) {
        super("main", rootTerminal);
        this._mapvp = rootTerminal.port({x: 0, y: 0}, MAP_W, MAP_H);
        const boundMoveBy = GameManager.player.moveBy.bind(GameManager.player);
        this._keyboardContext = new Input.KeyboardContext()
            .onDown(Input.KeyCode.W, this.renderCB(boundMoveBy, 0, -1))
            .onDown(Input.KeyCode.A, this.renderCB(boundMoveBy, -1, 0))
            .onDown(Input.KeyCode.S, this.renderCB(boundMoveBy, 0, 1))
            .onDown(Input.KeyCode.D, this.renderCB(boundMoveBy, 1, 0));
    }

    get center() { return GameManager.player.pos; }
    get keyboardContext() { return this._keyboardContext; }

    _cam(gameMap) {
        return {
            x: calc(this.center.x, gameMap.width, this._mapvp.width),
            y: calc(this.center.y, gameMap.height, this._mapvp.height),
        }
    }

    _mapToScreen(gameMap, point) {
        const {x, y} = this._cam(gameMap);
        return {
            x: point.x - x,
            y: point.y - y,
        }
    }

    _screenToMap(gameMap, point) {
        const {x, y} = this._cam(gameMap);
        return {
            x: point.x + x,
            y: point.y + y,
        }
    }

    _inBounds(pos) {
        const w = this._mapvp.width;
        const h = this._mapvp.height;
        return pos.x >= 0 && pos.x < w && pos.y >= 0 && pos.y < h;
    }

    _drawAtPosition(screenPos, glyph) {
        if (this._inBounds(screenPos)) {
            this._mapvp.drawGlyph(screenPos, glyph);
        }
    }

    _renderMap() {
        let screenPos;
        let mapPos;
        for (let sy=0; sy<this._mapvp.height; sy++) {
            for (let sx=0; sx<this._mapvp.width; sx++) {
                screenPos = {x: sx, y: sy};
                mapPos = this._screenToMap(GameManager.curMap, screenPos);
                const t = GameManager.curMap.getTile(mapPos);
                if (t.glyph !== null) {
                    //it's a real map tile
                    if (GameManager.player.canSee(mapPos)) {
                        //we can see it, draw normally
                        this._drawAtPosition(screenPos, t.glyph)
                    } else if (GameManager.curMap.isExplored(mapPos)) {
                        //we've explored it, so we remember the layout
                        const darkGlyph = Glyph.fromCharCode(t.glyph.char, Color.DarkBlue);
                        this._drawAtPosition(screenPos, darkGlyph);
                    }
                }
            }
        }
    }

    _renderEntities() {
        let blocker;
        for (let entity of GameManager.curEntities) {
            if (GameManager.player.canSee(entity)) {
                //if entity is in FOV
                const sPos = this._mapToScreen(GameManager.curMap, entity.pos);
                blocker = GameManager.getBlockerAt(entity.pos);
                if (blocker) {
                    //if there is a blocker, draw the blocker
                    this._drawAtPosition(sPos, blocker.glyph);
                } else if (GameManager.getEntitiesAt(entity.pos).length > 1) {
                    //if multiple entities, draw a *
                    const glyph = new Glyph('*', Color.Yellow);
                    this._drawAtPosition(sPos, glyph);
                } else {
                    //only one entity, draw it
                    this._drawAtPosition(sPos, entity.glyph);
                }
            }
        }
    }

    _renderStats() {
        //TODO: render stats
        const p = GameManager.player.pos;
        const mName = GameManager.curMap.name;
        this._terminal.writeAt({x: 0, y: 30}, `${mName} (${p.x},${p.y})`);
    }

    _onRender() {
        this._renderMap();
        this._renderEntities();
        this._renderStats();
    }

    
}