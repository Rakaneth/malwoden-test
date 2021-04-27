'use strict'

import { Calc, Glyph, Input, Terminal } from 'malwoden';
import { GameManager } from './game';
import img from './agm_16x16.png';
import { GameMap, MapFactory } from './gamemap';
const clamp = (val, low, high) => Math.max(low, Math.min(val, high));

const DrawManager = {
    _cam(gameMap, center, terminal) {
        const calc = (p, m, s) => clamp(p - Math.floor(s/2), 0, Math.max(0, m-s));

        return {
            x: calc(center.x, gameMap.width, terminal.width),
            y: calc(center.y, gameMap.height, terminal.height),
        };
    },

    _mapToScreen(gameMap, point, center, terminal) {
        const {x, y} = this._cam(gameMap, center, terminal);
        return {
            x: point.x - x, 
            y: point.y - y
        };
    },

    _screenToMap(gameMap, point, center, terminal) {
        const {x, y} = this._cam(gameMap, center, terminal);
        return {
            x: point.x + x,
            y: point.y + y,
        };
    },

    _inBounds(pos, terminal) {
        return pos.x >= 0 && pos.x < terminal.width && pos.y >= 0 && pos.y < terminal.height;
    },
    
    drawAtPosition(pos, glyph, terminal) {
        //const sPoint = this._mapToScreen(gameMap, pos, center, terminal);
        if (this._inBounds(pos, terminal)) {
            terminal.drawGlyph(pos, glyph);
        }
    }
}

window.onload = () => {
    const mountNode = document.getElementById('canvas');

    const displayOptions = {
        width: 50,
        height: 30,
        imageURL: img,
        mountNode,
        charWidth: 16,
        charHeight: 16,
    };
    
    const terminal = new Terminal.RetroTerminal(displayOptions);
    const testMap = MapFactory.drunkWalk(100, 75, "test-map", "Test Map");
    GameManager.addMap(testMap);
    GameManager.curMap = "test-map";
    const tempCenter = {x: 25, y: 25};
    const tempGlyph = new Glyph('X', Terminal.Color.Yellow);
    const tempMoveBy = (dx, dy) => {
        tempCenter.x += dx;
        tempCenter.y += dy;
        terminal.clear();
        renderMap();
        terminal.render();
    };

    const renderMap = () => {
        for (let x=0; x<terminal.width; x++) {
            for (let y=0; y<terminal.height; y++) {
                const mapPoint = DrawManager._screenToMap(GameManager.curMap, {x, y}, tempCenter, terminal);
                const t = GameManager.curMap.getTile(mapPoint.x, mapPoint.y);
                if (t.glyph != null) {
                    DrawManager.drawAtPosition({x, y}, t.glyph, terminal);
                }
                if (mapPoint.x === tempCenter.x && mapPoint.y === tempCenter.y) {
                    DrawManager.drawAtPosition({x, y}, tempGlyph, terminal);
                }
            }
        }
    }

    //Keyboard

    const movement = new Input.KeyboardContext()
        .onUp(Input.KeyCode.W, () => tempMoveBy(0, -1))
        .onUp(Input.KeyCode.A, () => tempMoveBy(-1, 0))
        .onUp(Input.KeyCode.S, () => tempMoveBy(0, 1))
        .onUp(Input.KeyCode.D, () => tempMoveBy(1, 0));

    const keyboard = new Input.KeyboardHandler();
    keyboard.setContext(movement);

    terminal.clear();
    renderMap();
    terminal.render();
}



