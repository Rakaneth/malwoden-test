'use strict'

import { Glyph, Input, Terminal } from 'malwoden';
import { GameManager } from './game';
import img from './agm_16x16.png';
import { MapFactory } from './gamemap';
import { EntityFactory, seed } from './factory';
import { ScreenManager } from './screens/screen';
import MainScreen from './screens/mainscreen';
import MessageScreen from './screens/msgscreen';
import CharScreen from './screens/charscreen';
import { nextNormal, rollDice, testDiff, testNormal, testRollDice, testUniform } from './rng';
import { Elf, Wolfborn, Dwarf } from './races';
import HelpScreen from './screens/helpscreen';
import DijkstraMap from './dijkstramap';
import TitleScreen from './screens/titlescreen';

window.onload = () => {
    const mountNode = document.getElementById('canvas');

    const displayOptions = {
        width: 60,
        height: 35,
        imageURL: img,
        mountNode,
        charWidth: 16,
        charHeight: 16,
    };
    
    const terminal = new Terminal.RetroTerminal(displayOptions);
    const testMap = MapFactory.drunkWalk(20, 20, "test-map", "Test Map", true);
    const bspTest = MapFactory.bsp(130, 82, "bspTest", "BSP Test", true);
    GameManager.addMap(testMap);
    GameManager.addMap(bspTest);
    const player = EntityFactory.makePlayer('rogue', "Farin", Dwarf);
    seed(player, testMap);
    for (let n=0; n<10; n++) {
        const npc = EntityFactory.randomCreature();
        seed(npc, testMap);
    }

    for (let e=0; e<10; e++) {
        const eq = EntityFactory.randomEquipment();
        seed(eq, testMap);
    }
    GameManager.curMap = "test-map";

    //ScreenManager.register(new MainScreen(terminal));
    ScreenManager.registerMany(
        terminal, 
        TitleScreen,
        MainScreen, 
        MessageScreen,
        CharScreen,
        HelpScreen);
    ScreenManager.curScreen = "title";

    //testNormal(1, 4, 2);
    //testNormal(1, 4, 5);
    //testDiff(10, 5, 15);

    GameManager.updateFOV();

    GameManager.addMsg("The quick brown fox jumps over the lazy dog." +
    " Sphinx of black quartz, judge my vow!");
    for (let i=1; i<=50; i++) {
        GameManager.addMsg(`Reasonably long message that is longer than forty-seven characters ${i}`);
    }
    GameManager.addMsg("Msg 51");
    GameManager.update();
    ScreenManager.render();
}



