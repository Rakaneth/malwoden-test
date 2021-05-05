import { Input } from 'malwoden';
import { GameManager } from '../game';
import { Screen, ScreenManager, makeStatString} from './screen';

function escCB() {
    ScreenManager.curScreen = "main";
}

export default class CharScreen extends Screen {
    constructor(terminal) {
        super("character", terminal);
        this._keyboardContext = new Input.KeyboardContext()
            .onDown(Input.KeyCode.Escape, escCB);
    }

    _onRender() {
        const player = GameManager.player;
        const bar = "-------------";
        this.box(0, 0, "Character");
        this.print(1, 1, `Name: ${player.name}`);
        this.print(1, 2, player.raceDesc);
        this.print(1, 4, "Base Stats");
        this.print(1, 5, bar);
        this.printPriStatBlock(1, 6, player);
        this.print(1, 10, "Combat Stats");
        this.print(1, 11, bar);
        this.printSecStatBlock(1, 12, player);
        this.print(1, 16, "Equipment");
        this.print(1, 17, bar);
        this.printEquipBlock(1, 18, player);
    }

    
}