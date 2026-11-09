import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import type { AuthenticatedRequest, AuthenticatedUser } from './auth.types.js';
import { AUTH_COOKIE_NAME } from './auth.constants.js';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) {}

  async canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const token = this.extractToken(request);

    if (!token) {
      throw new UnauthorizedException('Token de acesso não informado');
    }

    try {
      const payload = await this.jwtService.verifyAsync<AuthenticatedUser>(
        token,
        {
          algorithms: ['HS256'],
        },
      );

      if (
        !Number.isInteger(payload.sub) ||
        typeof payload.email !== 'string' ||
        typeof payload.csrf !== 'string' ||
        payload.csrf.length < 32 ||
        !Number.isInteger(payload.exp)
      ) {
        throw new UnauthorizedException('Token de acesso inválido');
      }

      request.user = payload;
      return true;
    } catch {
      throw new UnauthorizedException('Token de acesso inválido ou expirado');
    }
  }

  private extractToken(request: AuthenticatedRequest) {
    const token: unknown = request.cookies?.[AUTH_COOKIE_NAME];
    return typeof token === 'string' && token ? token : undefined;
  }
}
