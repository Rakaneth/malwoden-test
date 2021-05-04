import {ScreenManager, Screen} from './screen';
import { Color, Glyph, Input, Terminal } from 'malwoden';
import { clamp, wrap} from '../utils';
import { GameManager } from '../game';

const MAP_W = 50;
const MAP_H = 30;

function calc(p, m, s) {
    return clamp(p - Math.floor(s/2), 0, Math.max(0, m-s));
}

export default class MainScreen extends Screen {
    
    constructor(rootTerminal) {
        super("main", rootTerminal);
        this._mapvp = rootTerminal.port({x: 0, y: 0}, MAP_W, MAP_H);
        const boundMoveBy = GameManager.player.moveBy.bind(GameManager.player);
        const openMsgCB = () => {ScreenManager.curScreen = "message"; }
        this._toolTip = null;
        const boundOnClick = this._onClick.bind(this);
        this._keyboardContext = new Input.KeyboardContext()
            .onDown(Input.KeyCode.W, this.renderCB(boundMoveBy, 0, -1))
            .onDown(Input.KeyCode.A, this.renderCB(boundMoveBy, -1, 0))
            .onDown(Input.KeyCode.S, this.renderCB(boundMoveBy, 0, 1))
            .onDown(Input.KeyCode.D, this.renderCB(boundMoveBy, 1, 0))
            .onDown(Input.KeyCode.H, openMsgCB);
        this._mouseContext = new Input.MouseContext()
            .onMouseDown(boundOnClick);
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
        this._fillBar({x: 0, y: 31}, "HP", 10, 0.75, Color.Crimson);
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

    _renderTooltip(msg, sp) { 
        const l = msg.length;
        const tw = this._terminal.width;
        const txr = sp.x + 1;
        const txl = sp.x - l - 1;
        let tp;
        if (txr + l < tw) {
            tp = {x: txr, y: sp.y};
        } else if (txl >= 1) {
            tp = {x: sp.x - l, y: sp.y};
        }
        if (tp) this._terminal.writeAt(tp, msg, Color.White, Color.DarkGray); 
    }

    _onClick(p) {
        const sp = this._terminal.pixelToChar(p);
        if (this._inTerminal(sp)) {
            const mp = this._screenToMap(GameManager.curMap, sp);
            const maybeEntities = GameManager.getEntitiesAt(mp);
            if (maybeEntities.length > 0 && GameManager.playerCanSee(mp)) {
                this._toolTip = {
                    names: maybeEntities.map(e => e.name).join(),
                    sp,
                }
            } else {
                this._toolTip = null;
            }
            this.render();
        }
    }

    _fillBar(p, label, width, pct, fillColor) {
        const fillBars = Math.floor(width * pct);
        const l = label.length;
        this._terminal.writeAt(p, label);
        for (let i=0; i<width; i++) {
            let c = (i <= fillBars) ? fillColor : fillColor.blend(Color.Black);
            this._terminal.drawCharCode(
                {x: p.x+l+1+i, y: p.y}, 
                Terminal.CharCode.fullBlock, 
                c
            );
        }
    }

    _onRender() {
        this._renderMap();
        this._renderEntities();
        if (this._toolTip) {
            const {names, sp} = this._toolTip;
            this._renderTooltip(names, sp);
            this._toolTip = null;
        }
        this._renderStats();
        this._renderLastMsg();
    }
}