import { Input } from "malwoden";
import { Screen } from "./screen";
import { openHelpCB } from "./mainscreen";

export default class TitleScreen extends Screen {
    constructor(terminal) {
        super("title", terminal);
        this._keyboardContext = new Input.KeyboardContext()
            .onDown(Input.KeyCode.Enter, openHelpCB);
    }

    _onRender() {
        this.print(5, 10, "Rakaneth's Malwoden Playground");
        this.print(5, 11, "A small tech demo of Malwoden with no substance (yet)");
        this.print(5, 13, "Press ENTER to continue");
    }
}