import type { Request } from 'express';

export interface AuthenticatedUser {
  sub: number;
  email: string;
  csrf: string;
  exp: number;
  iat?: number;
}

export interface AuthenticatedRequest extends Request {
  user: AuthenticatedUser;
}
