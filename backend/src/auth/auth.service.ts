import {
  BadRequestException,
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as argon2 from 'argon2';
import { UserService } from '../user/user.service.js';
import { LoginDto } from './dto/login/login.dto.js';
import { RegisterDto } from './dto/register/register.dto.js';
import { SESSION_DURATION_SECONDS } from './auth.constants.js';

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

  private async createAuthResponse<T extends { id: number; email: string }>(
    user: T,
  ) {
    const accessToken = await this.jwtService.signAsync({
      sub: user.id,
      email: user.email,
    });

    return {
      accessToken,
      user,
      expiresIn: SESSION_DURATION_SECONDS,
    };
  }

  private normalizeEmail(email: string) {
    return email.trim().toLowerCase();
  }
}
