import { GameManager } from '../game';
import { GUI, Input } from 'malwoden';
import { Swatch } from '../swatch';

export function makeStatString(label, statValue) {
    return `${label} ${statValue.toString().padStart(2)}`;
}

export class Screen {
    constructor(name, rootTeminal) {
        this._name = name;
        this._terminal = rootTeminal;
        this._keyboardContext = null;
        this._mouseContext = null;
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

    _onMouseMove(p) {}

    _inTerminal(sp) {
        const w = this._terminal.width;
        const h = this._terminal.height;
        return sp.x >= 0 && sp.x < w && sp.y >= 0 && sp.y < h
    }

    mouseMove(p) {
        const pt = this._terminal.pixelToChar(p);
        const w = this._terminal.width;
        const h = this._terminal.height;
        if (pt.x >= 0 && pt.x < w && pt.y >= 0 && pt.y < h) {
            this._onMouseMove(pt);
        }
    }

    get keyboardContext() {
        if (!this._keyboardContext) {
            throw new Error(`Screen ${this._name} has not implemented a keyboard context`);
        }
        return this._keyboardContext;
    }

    get mouseContext() {
        return this._mouseContext;
    }

    renderCB(fn, ...args) {
        return function() {
            fn(...args);
            GameManager.updateFOV();
            ScreenManager.render();
        }
    }

    print(x, y, text, fore, back) {
        let fg = fore;
        let bg = back;
        if (fore && fore.length === 3) {
            fg = Swatch.toColor(fore);
        }

        if (back && back.length === 3) {
            bg = Swatch.toColor(back);
        }
        this._terminal.writeAt({x, y}, text, fg, bg);
    }

    box(x, y, title, w, h) {
        const width = w || this._terminal.width-1;
        const height = h || this._terminal.height-1;
        GUI.box(this._terminal, {
            origin: {x, y},
            width,
            height,
            title
        });
    }

    _printStat(x, y, label, stat) {
        const padStat = stat.toString().padStart(2);
        this.print(x, y, label);
        this.print(x+label.length+1, y, padStat, Swatch.statGreen);
    }

    _printEq(x, y, label, eq) {
        const eqName = eq ? eq.name : "Nothing";
        this.print(x, y, label);
        this.print(x+label.length+1, y, eqName, Swatch.statGreen);
    }

    printPriStatBlock(x, y, entity) {
        this._printStat(x, y, 'Str', entity.str);
        this._printStat(x, y+1, 'Stm', entity.stam);
        this._printStat(x, y+2, 'Spd', entity.spd);
        this._printStat(x+7, y, 'Skl', entity.skl);
        this._printStat(x+7, y+1,'Sag', entity.sag);
        this._printStat(x+7, y+2, 'Smt', entity.smt);
    }

    printSecStatBlock(x, y, entity) {
        this._printStat(x, y, 'Atp', entity.atp);
        this._printStat(x, y+1, 'Dfp', entity.dfp);
        this._printStat(x, y+2, 'Tou', entity.tou);
        this._printStat(x+7, y, 'Wil', entity.wil);
        this._printStat(x+7, y+1, 'Pwr', entity.pwr);
        this._printStat(x+7, y+2, 'Dmg', entity.dmg);
    }

    printEquipBlock(x, y, entity) {
        const wpn = entity.equippedWeapon;
        const arm = entity.equippedArmor;
        const trink = entity.equippedTrinket;

        this._printEq(x, y, "Weapon:", wpn);
        this._printEq(x, y+1, "Armor:", arm);
        this._printEq(x, y+2, "Trinket:", trink);
    }

}

class ScreensManager {
    constructor() {
        this._screens = {}
        this._curScreenID = "none";
        this._keyboard = new Input.KeyboardHandler();
        this._mouse = new Input.MouseHandler();
    }

    register(screen) {
        this._screens[screen.name] = screen;
    }

    registerMany(terminal, ...screenTypes) {
        for (let T of screenTypes) {
            this.register(new T(terminal));
        }
    }

    get curScreen() { return this._screens[this._curScreenID]; }
    set curScreen(screenName) { 
        this._curScreenID = screenName; 
        this._keyboard.clearContext();
        this._keyboard.setContext(this.curScreen.keyboardContext);
        this._mouse.clearContext();
        if (this.curScreen.mouseContext) {
            this._mouse.setContext(this.curScreen.mouseContext);
        }
        this.render();
    }

    render() {
        const pos = this._mouse.getPos();
        this.curScreen.mouseMove(pos);
        this.curScreen.render();
    }
}

export const ScreenManager = new ScreensManager();