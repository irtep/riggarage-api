export interface Rig {
    id: string;
    userId: string;
    rig: string;
};

export interface SaveNewRigRequest {
    userId: string;
    rig: string;
};

export interface UpdateRigRequest {
    id: string;
    rig: string;
};