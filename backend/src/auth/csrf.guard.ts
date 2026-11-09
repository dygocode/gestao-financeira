import { timingSafeEqual } from 'node:crypto';
import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { CSRF_HEADER_NAME } from './auth.constants.js';
import type { AuthenticatedRequest } from './auth.types.js';

const SAFE_METHODS = new Set(['GET', 'HEAD', 'OPTIONS']);

@Injectable()
export class CsrfGuard implements CanActivate {
  canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();

    if (SAFE_METHODS.has(request.method.toUpperCase())) return true;

    const header = request.headers[CSRF_HEADER_NAME];
    const providedToken = Array.isArray(header) ? header[0] : header;
    const expectedToken = request.user?.csrf;

    if (
      typeof providedToken !== 'string' ||
      typeof expectedToken !== 'string' ||
      !this.tokensMatch(providedToken, expectedToken)
    ) {
      throw new ForbiddenException('Token CSRF inválido ou ausente');
    }

    return true;
  }

  private tokensMatch(providedToken: string, expectedToken: string) {
    const provided = Buffer.from(providedToken);
    const expected = Buffer.from(expectedToken);

    return (
      provided.length === expected.length && timingSafeEqual(provided, expected)
    );
  }
}
