import { Rand } from "malwoden";
import { DEBUG } from './gameconfig';

export const GameRNG = new Rand.AleaRNG();
export const MapRNG = new Rand.AleaRNG();

export function getWeightedItem(tbl, weightFn) {
    const sum = Object.values(tbl)
        .reduce((acc, item) => acc + weightFn(item), 0);
    const roll = GameRNG.nextInt(0, sum);
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
    const diceEx = /(?<num>\d*)d(?<sides>\d+)(?<bonus>(\+|\-)(\d+))?/ig;
    const match = diceEx.exec(diceString);
    if (!match) {
        throw new Error(`Dice string ${diceString} could not be parsed`);
    }
    const sides = parseInt(match.groups.sides);
    const numDice = (match.groups.num === "") ? 1 : parseInt(match.groups.num);
    const bonus = match.groups.bonus ? parseInt(match.groups.bonus) : 0;
    let acc = 0;
    let logRolls = [];
    for (let i=0; i<numDice; i++) {
        let roll = GameRNG.nextInt(1, sides+1);
        acc += roll;
        logRolls.push(roll);
    }

    const total = acc + bonus;

    if (DEBUG) console.log(`Roll of ${diceString} produced ${logRolls} (total ${total})`);
    return total;
}

/*
let spare = 0.0;
let hasSpare = false;

export function nextNormal(mean, variance) {
    const stdDev = Math.sqrt(variance);

    if (hasSpare) {
        hasSpare = false;
        return spare * stdDev + mean;
    } else {
        let u = 0.0;
        let v = 0.0;
        let s = 0.0;

        do {
            u = GameRNG.next() * 2 - 1;
            v = GameRNG.next() * 2 - 1;
            s = u*u + v*v;
        } while (s >= 1 || s == 0);
        s = Math.sqrt(-2.0 * Math.log(s) / s);
        spare = v * s;
        hasSpare = true;
        return mean + stdDev * u * s;
    }
}
*/

export function nextNormal(min, max, rolls=3) {
    let v = (rolls < 2) ? 2 : rolls;
    let acc = 0;
    for (let i=0; i<v; i++) {
        let roll = GameRNG.nextInt(min, max+1);
        acc += roll;
    }
    return Math.floor(acc / v);
}

export function rollStat(stat, variance) {
    let min = stat - variance;
    let max = stat + variance;
    return nextNormal(min, max);
}

export function pctChance(pct) {
    return GameRNG.nextInt() < pct;
}

function testDiceHarness(fn, testFn, times, ...args) {
    let lowest = Infinity;
    let highest = -Infinity;
    let rolls = [];
    let sux = 0;
    for (let i=0; i<times; i++) {
        let roll = fn.apply(GameRNG, args);
        lowest = Math.min(lowest, roll);
        highest = Math.max(highest, roll);
        rolls.push(roll);
        if (testFn) {
            if (testFn(roll)) sux++;
        }
    }

    rolls.sort((a, b) => a - b);

    console.log(`Lowest roll was ${lowest}`);
    console.log(`Highest roll was ${highest}`);
    console.log(`Rolls were ${rolls}`);
    if (testFn) {
        console.log(`Rolls succeeded ${sux}/${times}`);
    }
}

export function testNormal(min, max, variance) {
    console.log(`Testing normal distribution for min=${min}, max=${max}, variance=${variance}`);
    testDiceHarness(nextNormal, null, 100, min, max, variance);
}

export function testUniform(min, max) {
    console.log(`Testing uniform distribution for min=${min}, max=${max}`);
    testDiceHarness(GameRNG.nextInt, null, 100, min, max+1);
}

export function testRollDice(diceString) {
    console.log(`Testing dice roll ${diceString}`);
    testDiceHarness(rollDice, null, 100, diceString);
}

export function testDiff(stat, diff, variance) {
    console.log(`Testing rolls of stat=${stat}, diff=${diff}, variance=${variance}`);
    const cb = (roll) => roll >= diff;
    testDiceHarness(rollStat, cb, 100, stat, variance);
}


