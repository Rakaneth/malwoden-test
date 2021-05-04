import { GameManager } from '../game';
import { Input } from 'malwoden';

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