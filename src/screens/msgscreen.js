import { clamp, wrap } from '../utils';
import { GUI, Input } from 'malwoden';
import { GameManager } from '../game';
import { Screen, escCB } from './screen';

export default class MessageScreen extends Screen {
    constructor(terminal) {
        super("message", terminal);
        this._downIdx = 0;
        const upCB = () => { 
            this._downIdx = clamp(this._downIdx-1, 0, GameManager.msgs.length-1);
        };
        const downCB = () => {
            this._downIdx = clamp(this._downIdx + 1, 0, GameManager.msgs.length-1);
        };
        this._keyboardContext = new Input.KeyboardContext()
            .onDown(Input.KeyCode.W, this.renderCB(upCB))
            .onDown(Input.KeyCode.S, this.renderCB(downCB))
            .onDown(Input.KeyCode.Escape, escCB);
    }

    _onRender() {
        let i=0;
        GUI.box(this._terminal, {
            origin: {x: 0, y: 0},
            width: this._terminal.width-1,
            height: this._terminal.height-1,
            title: "Messages",
        });

        let idx;

        if (this._downIdx !== 0) {
            idx = -this._downIdx;
        }
        
        //some JS trickery here:
        //idx remains undefined if this._downIdx is 0
        //which makes slice return the whole array
        for (let msg of GameManager.msgs.slice(0, idx).reverse()) {
            let list = wrap(msg, this._terminal.width-3);
            if (list.length + i > this._terminal.height-3) break;
            for (let s of list) {
                this._terminal.writeAt({x: 1, y: 1+i}, s);
                i++;
            } 
        }
    }
}