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
    bloodLevel?: number;
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

        if (this.input.hero) {
            const { attack, defense, hp } = this.input.hero.bonuses;
            if (attack) this.totalAttack *= 1 + (attack * this.input.hero.level) / 100;
            if (defense) this.totalDefense *= 1 + (defense * this.input.hero.level) / 100;
            if (hp) this.totalHp *= 1 + (hp * this.input.hero.level) / 100;
        }
    }
}

function Kampfsimulator() {
    const [attackerUnits, setAttackerUnits] = useState<{ [key: string]: number }>({});
    const [defenderUnits, setDefenderUnits] = useState<{ [key: string]: number }>({});
    const [wallLevel, setWallLevel] = useState<0 | 1 | 2 | 3>(3);
    const [heroLevel, setHeroLevel] = useState(0);
    const [heroBonuses, setHeroBonuses] = useState({ attack: 0, defense: 0, hp: 0 });

    const attacker = new Army({ name: "Angreifer", units: attackerUnits, hero: { name: "", level: heroLevel, bonuses: heroBonuses } });
    const defender = new Army({ name: "Verteidiger", units: defenderUnits, isDefender: true, wallLevel: wallLevel });

    const handleChange = (
        side: "attacker" | "defender",
        unit: string,
        value: number
    ) => {
        const setter = side === "attacker" ? setAttackerUnits : setDefenderUnits;
        const state = side === "attacker" ? attackerUnits : defenderUnits;
        setter({ ...state, [unit]: value });
    };

    const determineWinner = () => {
        const attackScore = attacker.totalAttack - defender.totalDefense;
        const defenseScore = defender.totalAttack - attacker.totalDefense;
        if (attackScore > defenseScore) return "Angreifer";
        if (defenseScore > attackScore) return "Verteidiger";
        return "Verteidiger";
    };

    return (
        <div className="p-4 max-w-6xl mx-auto text-white">
            <h1 className="text-2xl font-bold text-center mb-6">Kampfsimulator</h1>

            <div className="mb-4">
                <label className="block mb-2">Mauerstufe Verteidiger (0-3):</label>
                <input
                    type="number"
                    min={0}
                    max={3}
                    value={wallLevel}
                    onChange={(e) => setWallLevel(Number(e.target.value) as 0 | 1 | 2 | 3)}
                    className="bg-gray-700 text-white border border-gray-600 px-2 py-1 rounded"
                />
            </div>

            <div className="mb-4">
                <label className="block mb-2">Held: Angriff / Verteidigung / Leben (%):</label>
                <div className="flex gap-2">
                    <input type="number" value={heroBonuses.attack} onChange={e => setHeroBonuses({ ...heroBonuses, attack: +e.target.value })} className="w-16 bg-gray-700 text-white border border-gray-600 px-2 py-1 rounded" />
                    <input type="number" value={heroBonuses.defense} onChange={e => setHeroBonuses({ ...heroBonuses, defense: +e.target.value })} className="w-16 bg-gray-700 text-white border border-gray-600 px-2 py-1 rounded" />
                    <input type="number" value={heroBonuses.hp} onChange={e => setHeroBonuses({ ...heroBonuses, hp: +e.target.value })} className="w-16 bg-gray-700 text-white border border-gray-600 px-2 py-1 rounded" />
                    <input type="number" value={heroLevel} onChange={e => setHeroLevel(+e.target.value)} className="w-16 bg-gray-700 text-white border border-gray-600 px-2 py-1 rounded" placeholder="Lvl" />
                </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
                {["Angreifer", "Verteidiger"].map((role, i) => (
                    <div key={role} className="border p-4 rounded shadow bg-gray-800">
                        <h2 className="text-xl font-semibold mb-4">{role}</h2>
                        {Object.keys(units).map((unit) => (
                            <div key={unit} className="flex justify-between items-center mb-2">
                                <label className="w-2/3">{unit}</label>
                                <input
                                    type="number"
                                    min={0}
                                    value={i === 0 ? attackerUnits[unit] || 0 : defenderUnits[unit] || 0}
                                    onChange={(e) =>
                                        handleChange(i === 0 ? "attacker" : "defender", unit, parseInt(e.target.value) || 0)
                                    }
                                    className="w-20 bg-gray-700 text-white border border-gray-600 px-2 py-1 rounded"
                                />
                            </div>
                        ))}
                    </div>
                ))
      </div>

            <div className="mt-8 p-4 bg-gray-800 border border-gray-700 rounded shadow">
                <h3 className="text-lg font-bold mb-2">Ergebnisse</h3>
                <p>Angreifer Angriff: {attacker.totalAttack.toFixed(0)}</p>
                <p>Angreifer Verteidigung: {attacker.totalDefense.toFixed(0)}</p>
                <p>Angreifer Leben: {attacker.totalHp.toFixed(0)}</p>
                <hr className="my-2 border-gray-600" />
                <p>Verteidiger Angriff: {defender.totalAttack.toFixed(0)}</p>
                <p>Verteidiger Verteidigung: {defender.totalDefense.toFixed(0)}</p>
                <p>Verteidiger Leben: {defender.totalHp.toFixed(0)}</p>
                <hr className="my-2 border-gray-600" />
                <p className="font-bold">Gewinner: {determineWinner()}</p>
            </div>
        </div>
    );
}

export default Kampfsimulator;
