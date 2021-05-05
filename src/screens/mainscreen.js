import {ScreenManager, Screen} from './screen';
import { Color, Glyph, GUI, Input, Terminal } from 'malwoden';
import { clamp, wrap, clip} from '../utils';
import { GameManager } from '../game';
import { capitalize } from 'lodash';

const MAP_W = 60;
const MAP_H = 30;
const STAT_W = 60;
const STAT_H = 5;

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
            .onDown(Input.KeyCode.M, openMsgCB);
        this._mouseContext = new Input.MouseContext()
            .onMouseDown(boundOnClick);
        this._target = null;
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
        if (this._target) {
            const tPos = this._mapToScreen(GameManager.curMap, this._target);
            const tGlyph = new Glyph('X', Color.Cyan);
            this._drawAtPosition(tPos, tGlyph);
        }
    }

    _renderStats() {
        //TODO: render stats
        GUI.box(this._terminal, {
            origin: {x: 0, y: 30},
            width: STAT_W - 1,
            height: STAT_H -1,
        })
        const player = GameManager.player;
        const p = player.pos;
        const race = capitalize(player.raceName) || "Human"
        const mName = clip(GameManager.curMap.name, 19);
        const pName = clip(`${player.name} the ${race}`, 19);
        const pMoney = player.money;
        this._terminal.writeAt({x: 1, y: 31}, pName);
        this._terminal.writeAt({x: 1, y: 32}, `${mName} (${p.x},${p.y})`);
        this._terminal.writeAt({x: 1, y: 33}, `Silver: ${pMoney}`)
        this._terminal.writeAt({x: 20, y: 31}, `Atp ${player.atp}`);
        this._terminal.writeAt({x: 20, y: 32}, `Dfp ${player.dfp}`);
        this._terminal.writeAt({x: 20, y: 33}, `Tou ${player.tou}`);
        this._terminal.writeAt({x: 27, y: 31}, `Wil ${player.wil}`);
        this._terminal.writeAt({x: 27, y: 32}, `Pwr ${player.pwr}`);
        this._terminal.writeAt({x: 27, y: 33}, `Dmg ${player.dmg}`);
        this._terminal.writeAt({x: 40, y: 31}, "Placeholder");
        
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
        const curMap = GameManager.curMap;
        if (this._inTerminal(sp)) {
            const mp = this._screenToMap(curMap, sp);
            const canSee = GameManager.playerCanSee(mp);
            const maybeEntities = GameManager.getEntitiesAt(mp);
            if (maybeEntities.length > 0 && canSee) {
                this._toolTip = {
                    names: maybeEntities.map(e => e.name).join(),
                    sp,
                }
            } else {
                this._toolTip = null;
            }
            if (canSee) this._target = mp;
            this.render();
        } else {
            this._target = null;
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