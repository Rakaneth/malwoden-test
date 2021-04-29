'use strict'

import { Glyph, Input, Terminal } from 'malwoden';
import { GameManager } from './game';
import img from './agm_16x16.png';
import { MapFactory } from './gamemap';
import { EntityFactory, EntityType, seed } from './factory';
import { Entity } from './entity';
import { clamp } from './utils';
import { MainScreen } from './screen';

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
    
    const terminal = new Terminal.RetroTerminal(displayOptions);
    const testMap = MapFactory.drunkWalk(100, 75, "test-map", "Test Map");
    GameManager.addMap(testMap);
    GameManager.curMap = "test-map";
    const e1 = EntityFactory.randomCreature();
    const e2 = EntityFactory.randomCreature();
    const player = EntityFactory.makePlayer('rogue');
    seed(GameManager.curMap, e1);
    seed(GameManager.curMap, e2);
    seed(GameManager.curMap, player);

    let curScreen = new MainScreen(terminal);
    const keyboard = new Input.KeyboardHandler();
    keyboard.setContext(curScreen.keyboardContext);

    curScreen.render();
}



