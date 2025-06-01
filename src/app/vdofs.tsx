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
    hero?: Hero;
    shrine?: Shrine[];
    items?: { [key: string]: number };
    bloodLevel?: number; // 0 to 2 (0%, 1.5x, 2x etc)
    isDefender?: boolean;
    wallLevel?: 0 | 1 | 2 | 3;
}

interface Hero {
    name: string;
    level: number;
    bonuses: {
        attack?: number;
        defense?: number;
        hp?: number;
    };
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
        special: (army: Army) => {
            army.applyBonus("defense", 5);
        },
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
        special: (army: Army) => {
            army.applyBonus("attack", 3);
        },
    },
    Feldkoch: {
        attack: 5,
        defense: 10,
        hp: 1000,
        name: "Feldkoch",
        special: (army: Army) => {
            army.applyBonus("hp", 10);
        },
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
        const entries = Object.entries(this.input.units);
        entries.forEach(([key, value]) => {
            const unit = units[key];
            if (unit) {
                if (type === "attack") this.totalAttack += value * amount;
                if (type === "defense") this.totalDefense += value * amount;
                if (type === "hp") this.totalHp += value * amount;
            }
        });
    }

    calculateStats() {
        const entries = Object.entries(this.input.units);
        entries.forEach(([key, value]) => {
            const unit = units[key];
            if (unit) {
                let atk = unit.attack;
                let def = unit.defense;
                if (unit.type === "vampire" && this.input.bloodLevel) {
                    atk *= this.input.bloodLevel;
                    def *= this.input.bloodLevel;
                }
                this.totalAttack += atk * value;
                this.totalDefense += def * value;
                this.totalHp += unit.hp * value;
            }
        });

        if (this.input.hero) {
            const { attack, defense, hp } = this.input.hero.bonuses;
            if (attack) this.totalAttack *= 1 + (attack * this.input.hero.level) / 100;
            if (defense) this.totalDefense *= 1 + (defense * this.input.hero.level) / 100;
            if (hp) this.totalHp *= 1 + (hp * this.input.hero.level) / 100;
        }

        this.input.shrine?.forEach((s) => {
            switch (s.type) {
                case "earth":
                    this.applyBonus("attack", 2);
                    break;
                case "fire":
                    this.applyBonus("defense", 3);
                    break;
                case "shadow":
                    this.applyBonus("hp", 15);
                    break;
            }
        });

        entries.forEach(([key]) => {
            const unit = units[key];
            if (unit?.special) {
                unit.special(this);
            }
        });
    }
}

function Kampfsimulator() {
    const [log, setLog] = useState<string[]>([]);

    const startFight = () => {
        const angreifer = new Army({
            name: "Angreifer",
            units: {
                Vampirkrieger: 2,
                Vampirmagier: 300,
                Vampirlords: 725,
                Söldner: 125,
                Werwölfe: 130,
                Feldkoch: 1,
                Heiltrank: 205,
            },
            hero: { name: "Valnar", level: 6, bonuses: { attack: 1, defense: 1 } },
            bloodLevel: 1.5,
        });

        const verteidiger = new Army({
            name: "Verteidiger",
            units: {
                Elraslehrling: 198,
                Elrasmagier: 96,
                Schattengeister: 90,
                Heiltrank: 384,
                Stahlschwerter: 277,
                Skelette: 44,
            },
            hero: { name: "Morlon", level: 3, bonuses: { defense: 1, hp: 1 } },
            isDefender: true,
            wallLevel: 3,
        });

        const logOutput = [
            `${angreifer.input.name} Angriff: ${angreifer.totalAttack.toFixed(0)}, Verteidigung: ${angreifer.totalDefense.toFixed(0)}, Leben: ${angreifer.totalHp.toFixed(0)}`,
            `${verteidiger.input.name} Angriff: ${verteidiger.totalAttack.toFixed(0)}, Verteidigung: ${verteidiger.totalDefense.toFixed(0)}, Leben: ${verteidiger.totalHp.toFixed(0)}`,
            `Gewinner: ${angreifer.totalAttack > verteidiger.totalDefense ? "Angreifer" : "Verteidiger"}`,
        ];
        setLog(logOutput);
    };

    return (
        <div className="p-4">
            <h1 className="text-xl font-bold mb-4">Kampfsimulator</h1>
            <button
                className="bg-blue-500 text-white px-4 py-2 rounded"
                onClick={startFight}
            >
                Kampf starten
            </button>
            <div className="mt-4">
                {log.map((line, i) => (
                    <p key={i}>{line}</p>
                ))}
            </div>
        </div>
    );
}

export default Kampfsimulator;
