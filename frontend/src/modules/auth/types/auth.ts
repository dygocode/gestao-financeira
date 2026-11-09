export interface AuthUser { id: number; email: string; name: string | null; createdAt?: string; updatedAt?: string; }
export interface AuthSession { user: AuthUser; expiresIn: number; }
export interface LoginInput { email: string; password: string; }
export interface RegisterInput extends LoginInput { name: string; }
