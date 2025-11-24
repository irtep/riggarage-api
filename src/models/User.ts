export interface User {
  id: number;
  username: string;
  admin: boolean;
  password_hash: string;
  created_at: string;
}

export interface UserWithoutPassword {
  id: number;
  username: string;
  admin: boolean;
  created_at: string;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  password: string;
  admin: boolean;
  auth: string; // authorization code for registration
}