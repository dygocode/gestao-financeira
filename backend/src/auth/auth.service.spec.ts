import { JwtService } from '@nestjs/jwt';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import * as argon2 from 'argon2';
import { SESSION_DURATION_SECONDS } from './auth.constants.js';
import { LoginDto } from './dto/login/login.dto.js';
import { AuthService } from './auth.service.js';

describe('AuthService login', () => {
  const findCredentialsByEmail = vi.fn();
  const usersService = { findCredentialsByEmail };
  const jwtService = new JwtService({
    secret: 'unit-test-secret',
    signOptions: {
      expiresIn: SESSION_DURATION_SECONDS,
      algorithm: 'HS256',
    },
  });
  const service = new AuthService(usersService as never, jwtService);
  let passwordHash: string;

  beforeAll(async () => {
    passwordHash = await argon2.hash('Admin@123');
  });

  beforeEach(() => vi.clearAllMocks());

  it('valida o formato do campo e-mail', async () => {
    const dto = plainToInstance(LoginDto, {
      email: 'email-inválido',
      password: 'Admin@123',
    });

    const errors = await validate(dto);

    expect(errors.some((error) => error.property === 'email')).toBe(true);
  });

  it('valida o preenchimento do campo senha', async () => {
    const dto = plainToInstance(LoginDto, {
      email: 'admin@fintech.com',
      password: '',
    });

    const errors = await validate(dto);

    expect(errors.some((error) => error.property === 'password')).toBe(true);
  });

  it('recusa uma senha incorreta', async () => {
    findCredentialsByEmail.mockResolvedValue({
      id: 4,
      email: 'admin@fintech.com',
      name: 'Admin',
      passwordHash,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    await expect(
      service.login({ email: 'admin@fintech.com', password: 'senha-errada' }),
    ).rejects.toThrow('E-mail ou senha inválidos');
  });

  it('gera token de acesso com expiração configurada', async () => {
    findCredentialsByEmail.mockResolvedValue({
      id: 4,
      email: 'admin@fintech.com',
      name: 'Admin',
      passwordHash,
      createdAt: new Date('2026-11-09T12:00:00.000Z'),
      updatedAt: new Date('2026-11-09T12:00:00.000Z'),
    });

    const result = await service.login({
      email: '  ADMIN@FINTECH.COM ',
      password: 'Admin@123',
    });
    const payload = await jwtService.verifyAsync<{
      sub: number;
      email: string;
      iat: number;
      exp: number;
    }>(result.accessToken);

    expect(findCredentialsByEmail).toHaveBeenCalledWith('admin@fintech.com');
    expect(payload.sub).toBe(4);
    expect(payload.email).toBe('admin@fintech.com');
    expect(payload.exp - payload.iat).toBe(SESSION_DURATION_SECONDS);
    expect(result.expiresIn).toBe(SESSION_DURATION_SECONDS);
  });
});
