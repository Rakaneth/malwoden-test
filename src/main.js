'use strict'

import { Glyph, Input, Terminal } from 'malwoden';
import { GameManager } from './game';
import img from './agm_16x16.png';
import { MapFactory } from './gamemap';
import { EntityFactory, seed } from './factory';
import { Entity } from './entity';
const clamp = (val, low, high) => Math.max(low, Math.min(val, high));

const DrawManager = {
    _cam(gameMap, center, term) {
        const calc = (p, m, s) => clamp(p - Math.floor(s/2), 0, Math.max(0, m-s));

        return {
            x: calc(center.x, gameMap.width, term.width),
            y: calc(center.y, gameMap.height, term.height),
        };
    },

    _mapToScreen(gameMap, point, center, term) {
        const {x, y} = this._cam(gameMap, center, term);
        return {
            x: point.x - x, 
            y: point.y - y
        };
    },

    _screenToMap(gameMap, point, center, term) {
        const {x, y} = this._cam(gameMap, center, term);
        return {
            x: point.x + x,
            y: point.y + y,
        };
    },

    _inBounds(pos, term) {
        return pos.x >= 0 && pos.x < term.width && pos.y >= 0 && pos.y < term.height;
    },
    
    drawAtPosition(pos, glyph, term) {
        //const sPoint = this._mapToScreen(gameMap, pos, center, terminal);
        if (this._inBounds(pos, term)) {
            term.drawGlyph(pos, glyph);
        }
    }
}

window.onload = () => {
    const mountNode = document.getElementById('canvas');

    const displayOptions = {
        width: 50,
        height: 35,
        imageURL: img,
        mountNode,
        charWidth: 16,
        charHeight: 16,
    };

    const MAP_WIDTH = 50;
    const MAP_HEIGHT = 30;
    
    const terminal = new Terminal.RetroTerminal(displayOptions);
    const viewport = terminal.port({x: 0, y: 0}, MAP_WIDTH, MAP_HEIGHT);
    const testMap = MapFactory.drunkWalk(100, 75, "test-map", "Test Map");
    GameManager.addMap(testMap);
    GameManager.curMap = "test-map";
    const e1 = EntityFactory.makeCreature('wolf');
    const e2 = EntityFactory.makeCreature('rogue');
    seed(GameManager.curMap, e1);
    seed(GameManager.curMap, e2);
    let tempCenter = {x: 25, y: 25};
    const tempGlyph = new Glyph('X', Terminal.Color.Yellow);
    const tempMoveBy = (dx, dy) => {
        tempCenter.x += dx;
        tempCenter.y += dy;
        terminal.clear();
        renderMap();
        terminal.render();
    };

    const renderMap = () => {
        for (let x=0; x<viewport.width; x++) {
            for (let y=0; y<viewport.height; y++) {
                const mapPoint = DrawManager._screenToMap(GameManager.curMap, {x, y}, tempCenter, viewport);
                const maybeEntities = GameManager.getEntitiesAt(mapPoint.x, mapPoint.y);
                switch (maybeEntities.length) {
                    case 0: 
                        //no entities, draw map tile
                        const t = GameManager.curMap.getTile(mapPoint.x, mapPoint.y);
                        if (t.glyph != null) {
                            DrawManager.drawAtPosition({x, y}, t.glyph, viewport);
                        }
                        if (mapPoint.x === tempCenter.x && mapPoint.y === tempCenter.y) {
                            DrawManager.drawAtPosition({x, y}, tempGlyph, viewport);
                        }
                        break;
                    case 1: 
                        //only one entity, draw it if in view
                        const eGlyph = maybeEntities[0].glyph;
                        DrawManager.drawAtPosition({x, y}, eGlyph, viewport);
                        break;
                    default: 
                        //more than one entity, draw the one with the highest layer
                        const toDraw = maybeEntities.reduce((a, b) => (a.layer > b.layer) ? a : b);
                        DrawManager.drawAtPosition({x, y}, toDraw.glyph, viewport);
                }
            }
        }
        terminal.writeAt({x: 0, y: 30}, `Current Position: ${tempCenter.x}, ${tempCenter.y}`);
    }
    
    //Keyboard
    const movement = new Input.KeyboardContext()
        .onUp(Input.KeyCode.W, () => tempMoveBy(0, -1))
        .onUp(Input.KeyCode.A, () => tempMoveBy(-1, 0))
        .onUp(Input.KeyCode.S, () => tempMoveBy(0, 1))
        .onUp(Input.KeyCode.D, () => tempMoveBy(1, 0));

    const keyboard = new Input.KeyboardHandler();

    //Mouse
    const mouseMovement = new Input.MouseContext()
        .onMouseUp((pos) => {
            const termPos = terminal.pixelToChar(pos);
            tempCenter = DrawManager._screenToMap(GameManager.curMap, termPos, tempCenter, viewport);
            terminal.clear();
            renderMap();
            terminal.render();
        });
    
    const mouse = new Input.MouseHandler();

    keyboard.setContext(movement);
    mouse.setContext(mouseMovement);

    terminal.clear();
    renderMap();
    terminal.render();
}



