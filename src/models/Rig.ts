export interface Rig {
    id: number;
    username: string;
    rig: string;
};

export interface SaveNewRigRequest {
    username: string;
    rig: string;
};

export interface UpdateRigRequest {
    rig: string;
};