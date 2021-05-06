import { CharCode } from "malwoden";
import { EquipmentStats } from "./components";
import { EquipSlots } from "./equipslots";
import { Swatch } from "./swatch";

export const EQUIPMENT = {
    wolfFangs: {
        name: "Wolf Fangs",
        desc: "Sharp fangs from a large wolf, crudely strapped together by rawhide",
        glyph: {
            char: CharCode.greekSmallLetterPi,
            color: Swatch.wolfBrown,
        },
        tags: ["weapon", "primitive", "melee"],
        //TODO: weapon egos
        atk: 1,
        dmg: "1d4",
        slot: EquipSlots.WEAPON,
        freq: 5,
    },
    wolfClaws: {
        name: "Wolf Claws",
        desc: "Short, furry claws from a large wolf, fashioned into crude gloves",
        glyph: {
            char: CharCode.greekSmallLetterEpsilon,
            color: Swatch.wolfBrown,
        },
        tags: ["weapon", "primitive", "melee"],
        atk: 1,
        dmg: "1d3",
        slot: EquipSlots.WEAPON,
        freq: 5,
    },
    ironSword: {
        name: "Iron Sword",
        desc: "A serviceable, sturdy shortsword",
        glyph: {
            char: CharCode.notSign,
            color: Swatch.ironMetal,
        },
        tags: ["weapon", "metal", "iron", "melee"],
        dmg: "1d6",
        slots: EquipSlots.WEAPON,
        freq: 3,
    },
    torch: {
        name: "Torch",
        desc: "A long length of wood, serviceable as a torch.",
        glyph: {
            char: '~',
            color: Swatch.fireOrange,
        },
        tags: ["torch"],
        vision: 8,
        slots: EquipSlots.TORCH,
        freq: 10,
    }
}