import { GameManager } from "./game";
import { clamp } from "./utils";

//action generators should return functions that take no params, bind up
//all the passed params, and return cost of the action

export function makeTryMoveAction(entity, dx, dy) {
    //TODO: check for walls/hostiles
    return function() {
        entity.moveBy(dx, dy);
        return Math.max(0.01, 0.5 - entity.spd/100);
    }
}

//wait does nothing for a full round
export function makeWaitAction() {
    return function() {
        return 1;
    }
}

//trigger upkeep each tick
export function makeSentinelAction() {
    return function() {
        GameManager.upkeep();
        return 1;
    }
}

