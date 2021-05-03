import { Rand } from "malwoden";

export const GameRNG = new Rand.AleaRNG();
export const MapRNG = new Rand.AleaRNG();

export function getWeightedItem(tbl, weightFn) {
    const sum = Object.values(tbl)
        .reduce((a, b) => weightFn(a) + weightFn(b), 0);
    const roll = GameRNG.nextInt(0, sum-1);
    let acc = 0;
    for (let k in tbl) {
        let o = tbl[k];
        acc += weightFn(o);
        if (roll < acc) {
            return [k, o];
        }
    }
}

export function rollDice(diceString) {
    const diceEx = /(?<num>\d+)d(?<sides>\d+)(?<bonus>(\+|\-)(\d+))?/ig;
    const match = diceEx.exec(diceString);
    if (match.length === 0) {
        throw new Error(`Dice string ${diceString} could not be parsed`);
    }
    const sides = parseInt(match.groups.sides);
    const numDice = parseInt(match.groups.num);
    const bonus = match.groups.bonus ? parseInt(match.groups.bonus) : 0;
    let acc = 0;
    let logRolls = [];
    for (let i=0; i<numDice; i++) {
        let roll = GameRNG.nextInt(1, sides);
        acc += roll;
        logRolls.push(roll);
    }

    const total = acc + bonus;

    console.log(`Roll of ${diceString} produced ${logRolls} (total ${total})`);
    return total;
}

export function pctChance(pct) {
    return GameRNG.nextInt(0, 99) < pct;
}


