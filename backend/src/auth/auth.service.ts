import {
  BadRequestException,
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as argon2 from 'argon2';
import { randomBytes } from 'node:crypto';
import { UserService } from '../user/user.service.js';
import { LoginDto } from './dto/login/login.dto.js';
import { RegisterDto } from './dto/register/register.dto.js';
import { SESSION_DURATION_SECONDS } from './auth.constants.js';
import type { AuthenticatedUser } from './auth.types.js';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UserService,
    private readonly jwtService: JwtService,
  ) {}

  async register(data: RegisterDto) {
    const email = this.normalizeEmail(data.email);
    const name = data.name.trim();

    if (!name) {
      throw new BadRequestException('Nome é obrigatório');
    }

    const existingUser = await this.usersService.findCredentialsByEmail(email);

    if (existingUser) {
      throw new ConflictException('E-mail já cadastrado');
    }

    const passwordHash = await argon2.hash(data.password);
    const user = await this.usersService.createWithPassword({
      email,
      name,
      passwordHash,
    });

    return this.createAuthResponse(user);
  }

  async login(data: LoginDto) {
    const email = this.normalizeEmail(data.email);
    const credentials = await this.usersService.findCredentialsByEmail(email);

    if (!credentials) {
      throw new UnauthorizedException('E-mail ou senha inválidos');
    }

    const passwordMatches = await argon2.verify(
      credentials.passwordHash,
      data.password,
    );

    if (!passwordMatches) {
      throw new UnauthorizedException('E-mail ou senha inválidos');
    }

    const user = {
      id: credentials.id,
      email: credentials.email,
      name: credentials.name,
      createdAt: credentials.createdAt,
      updatedAt: credentials.updatedAt,
    };

    return this.createAuthResponse(user);
  }

  async getSession(authenticatedUser: AuthenticatedUser) {
    const user = await this.usersService.findById(authenticatedUser.sub);

    if (!user) {
      throw new UnauthorizedException('Usuário da sessão não encontrado');
    }

    const nowInSeconds = Math.floor(Date.now() / 1000);

    return {
      user,
      expiresIn: Math.max(0, authenticatedUser.exp - nowInSeconds),
      csrfToken: authenticatedUser.csrf,
    };
  }

  private async createAuthResponse<T extends { id: number; email: string }>(
    user: T,
  ) {
    const csrfToken = randomBytes(32).toString('hex');
    const accessToken = await this.jwtService.signAsync({
      sub: user.id,
      email: user.email,
      csrf: csrfToken,
    });

    return {
      accessToken,
      user,
      expiresIn: SESSION_DURATION_SECONDS,
      csrfToken,
    };
  }

  private normalizeEmail(email: string) {
    return email.trim().toLowerCase();
  }
}
