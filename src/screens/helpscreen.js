import { Color, Input } from "malwoden";
import { Screen, escCB } from "./screen"


export default class HelpScreen extends Screen {
    constructor(terminal) {
        super("help", terminal);
        this._keyboardContext = new Input.KeyboardContext()
            .onDown(Input.KeyCode.Escape, escCB);
    }

    _printCmd(x, y, key, cmdDesc) {
        this.print(x, y, key);
        this.print(x+6, y, cmdDesc, Color.Cyan);
    }

    _onRender() {
        this.box(0, 0, "Help");
        this._printCmd(1, 1, "Key", "Command");
        this.print(1, 2, "Main screen");
        this._printCmd(1, 3, "h", "This help screen");
        this._printCmd(1, 4, "w", "Move up");
        this._printCmd(1, 5, "a", "Move left");
        this._printCmd(1, 6, "s", "Move down");
        this._printCmd(1, 7, "d", "Move right");
        this._printCmd(1, 8, "c", "Show character screen");
        this._printCmd(1, 9, "m", "Show messages");

        this.print(1, 11, "Help screen (this screen)");
        this._printCmd(1, 12, "Esc", "Return to main screen");

        this.print(1, 14, "Character screen");
        this._printCmd(1, 15, "Esc", "Return to main screen");
        
        this.print(1, 17, "Message screen");
        this._printCmd(1, 18, "w", "Scroll up");
        this._printCmd(1, 19, "d", "Scroll down");
        this._printCmd(1, 20, "Esc", "Return to main screen");

        this.print(1, 22, "Left-click on an object in the world to examine it.");
    }
}