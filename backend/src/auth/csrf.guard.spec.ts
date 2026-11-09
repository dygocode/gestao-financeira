import { ForbiddenException, type ExecutionContext } from '@nestjs/common';
import { CsrfGuard } from './csrf.guard.js';

describe('CsrfGuard', () => {
  const guard = new CsrfGuard();

  function context(method: string, provided?: string, expected?: string) {
    return {
      switchToHttp: () => ({
        getRequest: () => ({
          method,
          headers: provided ? { 'x-csrf-token': provided } : {},
          user: expected ? { csrf: expected } : undefined,
        }),
      }),
    } as ExecutionContext;
  }

  it('permite métodos seguros sem token CSRF', () => {
    expect(guard.canActivate(context('GET'))).toBe(true);
  });

  it('permite mutação quando header e claim são iguais', () => {
    const token = 'a'.repeat(64);
    expect(guard.canActivate(context('POST', token, token))).toBe(true);
  });

  it('bloqueia mutação sem token CSRF válido', () => {
    expect(() =>
      guard.canActivate(context('DELETE', 'token-incorreto', 'b'.repeat(64))),
    ).toThrow(ForbiddenException);
  });
});
