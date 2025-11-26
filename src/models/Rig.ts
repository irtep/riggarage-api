export interface FamiliarStats {
    speed: number;
    armour: number;
    emptySlots: number;
};

export interface RigObject {
    id: number | string; // used to have numbers in old system, were rigs were only in browser. switched to string now, but i keep number type here too
    userId: number;
    name: string;
    chassis: string;
    speed: number;
    realSpeed: number;
    armour: number;
    handling: number;
    resistanceFields: number;
    emptySlots: number;
    selectedWeapons: string[];
    mods: string[];
    gunnerSpecial: string;
    driverSpecial: string;
    rightTool: string[];
    concealedWeapon: string;
    familiar: string[];
    familiarStats: FamiliarStats;
    mines: string[];
    handlingMods: number;
}
/*
export interface Rig {
    id: string;
    userId: string;
    rig: string;
};
*/
export interface SaveNewRigRequest {
    userId: string;
    rig: RigObject;
};

export interface UpdateRigRequest {
    id: string;
    rig: RigObject;
};