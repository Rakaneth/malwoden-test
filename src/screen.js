import { Color, Glyph, GUI, Input } from 'malwoden';
import { GameManager } from './game';
import { GameMap } from './gamemap';
import { clamp, wrap } from './utils';

export class Screen {
    constructor(name, rootTeminal) {
        this._name = name;
        this._terminal = rootTeminal;
        this._keyboardContext = null;
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
        if (!this._keyboardContext) {
            throw new Error(`Screen ${this._name} has not implemented a keyboard context`);
            return null;
        }
        return this._keyboardContext;
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

class ScreensManager {
    constructor() {
        this._screens = {}
        this._curScreenID = "none";
        this._keyboard = new Input.KeyboardHandler();
    }

    register(screen) {
        this._screens[screen.name] = screen;
    }

    registerMany(terminal, ...screenTypes) {
        for (let t of screenTypes) {
            this.register(new t(terminal));
        }
    }

    get curScreen() { return this._screens[this._curScreenID]; }
    set curScreen(screenName) { 
        this._curScreenID = screenName; 
        this._keyboard.clearContext();
        this._keyboard.setContext(this.curScreen.keyboardContext);
        this.render();
    }

    render() {
        this.curScreen.render();
    }
}

export const ScreenManager = new ScreensManager();

export class MainScreen extends Screen {
    
    constructor(rootTerminal) {
        super("main", rootTerminal);
        this._mapvp = rootTerminal.port({x: 0, y: 0}, MAP_W, MAP_H);
        const boundMoveBy = GameManager.player.moveBy.bind(GameManager.player);
        const openMsgCB = () => {ScreenManager.curScreen = "message"; }
        this._displayMsgs = false;
        this._keyboardContext = new Input.KeyboardContext()
            .onDown(Input.KeyCode.W, this.renderCB(boundMoveBy, 0, -1))
            .onDown(Input.KeyCode.A, this.renderCB(boundMoveBy, -1, 0))
            .onDown(Input.KeyCode.S, this.renderCB(boundMoveBy, 0, 1))
            .onDown(Input.KeyCode.D, this.renderCB(boundMoveBy, 1, 0))
            .onDown(Input.KeyCode.H, openMsgCB);
    }

    get center() { return GameManager.player.pos; }

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

    _renderLastMsg() {
        if (GameManager.msgs.length > 0) {
            let y = 0;
            let wrapped = wrap(GameManager.lastMsg, 50);
            for (let s of wrapped) {
                this._terminal.writeAt({x: 0, y}, s);
                y++;
            }
        }
    }

    _onRender() {
        this._renderMap();
        this._renderEntities();
        this._renderStats();
        this._renderLastMsg();
        
    }
}

export class MessageScreen extends Screen {
    constructor(terminal) {
        super("message", terminal);
        this._downIdx = 0;
        const upCB = () => { 
            this._downIdx = clamp(this._downIdx-1, 0, GameManager.msgs.length-1);
        };
        const downCB = () => {
            this._downIdx = clamp(this._downIdx + 1, 0, GameManager.msgs.length-1);
        };
        const escCB = () => { ScreenManager.curScreen = "main"; }
        this._keyboardContext = new Input.KeyboardContext()
            .onDown(Input.KeyCode.W, this.renderCB(upCB))
            .onDown(Input.KeyCode.S, this.renderCB(downCB))
            .onDown(Input.KeyCode.Escape, escCB);
    }

    _onRender() {
        let i=0;
        GUI.box(this._terminal, {
            origin: {x: 0, y: 0},
            width: 49,
            height: 34,
            title: "Messages",
        });

        let idx;

        if (this._downIdx !== 0) {
            idx = -this._downIdx;
        }
        
        //some JS trickery here:
        //idx remains undefined if this._downIdx is 0
        //which makes slice return the whole array
        for (let msg of GameManager.msgs.slice(0, idx).reverse()) {
            let list = wrap(msg, 47);
            if (list.length + i > 33) break;
            for (let s of list) {
                this._terminal.writeAt({x: 1, y: 1+i}, s);
                i++;
            } 
        }
    }
}