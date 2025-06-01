import React, { useState } from "react";

interface Unit {
    name: string;
    attack: number;
    defense: number;
    hp: number;
    special?: (army: Army) => void;
    type?: "normal" | "vampire";
}

interface ArmyInput {
    name: string;
    units: { [key: string]: number };
    heroBonuses?: HeroBonuses;
    shrine?: Shrine[];
    bloodLevel?: number;
    isDefender?: boolean;
    wallLevel?: 0 | 1 | 2 | 3;
}

interface HeroBonuses {
    attack?: number;
    defense?: number;
    hp?: number;
}

interface Shrine {
    type: "earth" | "fire" | "shadow";
}

const units: { [key: string]: Unit } = {
    Ritter: { attack: 10, defense: 35, hp: 150, name: "Ritter" },
    Heiler: { attack: 5, defense: 15, hp: 1000, name: "Heiler" },
    General: {
        attack: 20,
        defense: 60,
        hp: 400,
        name: "General",
        special: (army: Army) => army.applyBonus("defense", 5),
    },
    Vampirkrieger: { attack: 9, defense: 18, hp: 300, name: "Vampirkrieger", type: "vampire" },
    Vampirmagier: { attack: 5, defense: 30, hp: 180, name: "Vampirmagier", type: "vampire" },
    Vampirlords: { attack: 30, defense: 22, hp: 380, name: "Vampirlords", type: "vampire" },
    Elraslehrling: { attack: 15, defense: 30, hp: 300, name: "Elraslehrling" },
    Elrasmagier: { attack: 25, defense: 50, hp: 500, name: "Elrasmagier" },
    Schattengeister: { attack: 50, defense: 100, hp: 450, name: "Schattengeister" },
    Söldner: { attack: 10, defense: 20, hp: 150, name: "Söldner" },
    Werwölfe: { attack: 30, defense: 40, hp: 300, name: "Werwölfe" },
    Diebinnen: { attack: 3, defense: 6, hp: 200, name: "Diebinnen" },
    Hauptmann: {
        attack: 20,
        defense: 60,
        hp: 400,
        name: "Hauptmann",
        special: (army: Army) => army.applyBonus("attack", 3),
    },
    Feldkoch: {
        attack: 5,
        defense: 10,
        hp: 1000,
        name: "Feldkoch",
        special: (army: Army) => army.applyBonus("hp", 10),
    },
    Heiltrank: { attack: 0, defense: 0, hp: 150, name: "Heiltrank" },
    Stahlschwerter: { attack: 5, defense: 5, hp: 0, name: "Stahlschwerter" },
    Rüstungen: { attack: 0, defense: 0, hp: 100, name: "Rüstungen" },
    Flammentränke: { attack: 300, defense: 300, hp: 0, name: "Flammentränke" },
    Skelette: { attack: 6, defense: 12, hp: 100, name: "Skelette" },
};

class Army {
    input: ArmyInput;
    totalAttack = 0;
    totalDefense = 0;
    totalHp = 0;

    constructor(input: ArmyInput) {
        this.input = input;
        this.calculateStats();
    }

    applyBonus(type: "attack" | "defense" | "hp", amount: number) {
        Object.entries(this.input.units).forEach(([key, value]) => {
            const unit = units[key];
            if (!unit) return;
            if (type === "attack") this.totalAttack += value * amount;
            if (type === "defense") this.totalDefense += value * amount;
            if (type === "hp") this.totalHp += value * amount;
        });
    }

    calculateStats() {
        Object.entries(this.input.units).forEach(([key, value]) => {
            const unit = units[key];
            if (!unit) return;
            let atk = unit.attack;
            let def = unit.defense;
            if (unit.type === "vampire" && this.input.bloodLevel) {
                atk *= this.input.bloodLevel;
                def *= this.input.bloodLevel;
            }
            this.totalAttack += atk * value;
            this.totalDefense += def * value;
            this.totalHp += unit.hp * value;
        });

        Object.entries(this.input.units).forEach(([key]) => {
            const unit = units[key];
            if (unit?.special) unit.special(this);
        });

        if (this.input.shrine) {
            this.input.shrine.forEach((s) => {
                if (s.type === "earth") this.applyBonus("attack", 2);
                if (s.type === "fire") this.applyBonus("defense", 3);
                if (s.type === "shadow") this.applyBonus("hp", 15);
            });
        }

        if (this.input.heroBonuses) {
            const { attack, defense, hp } = this.input.heroBonuses;
            if (attack) this.totalAttack *= 1 + attack / 100;
            if (defense) this.totalDefense *= 1 + defense / 100;
            if (hp) this.totalHp *= 1 + hp / 100;
        }

        if (this.input.isDefender && this.input.wallLevel) {
            const wallReduction = 1 - 0.3 * this.input.wallLevel;
            this.totalHp *= wallReduction;
        }
    }
}

function Kampfsimulator() {
    return <div className="text-white">Demnächst hier: überarbeitete Version</div>;
}

export default Kampfsimulator;
