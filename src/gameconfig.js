export const DEBUG = true;

export function debugPrint(txt, phase) {
    if (DEBUG) {
        let toPrint = txt;
        if (phase) {
            toPrint = `[${phase}] ${txt}`;
        }
        console.log(toPrint);
    }
}