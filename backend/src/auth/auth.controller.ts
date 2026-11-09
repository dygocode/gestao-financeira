import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Res,
  UseGuards,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { CookieOptions, Response } from 'express';
import { AuthService } from './auth.service.js';
import { LoginDto } from './dto/login/login.dto.js';
import { RegisterDto } from './dto/register/register.dto.js';
import { AUTH_COOKIE_NAME, SESSION_DURATION_MS } from './auth.constants.js';
import { AuthGuard } from './auth.guard.js';
import type { AuthenticatedUser } from './auth.types.js';
import { CurrentUser } from './current-user.decorator.js';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
  ) {}

  @Post('register')
  async register(
    @Body() data: RegisterDto,
    @Res({ passthrough: true }) response: Response,
  ) {
    const session = await this.authService.register(data);
    return this.sendSession(response, session);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(
    @Body() data: LoginDto,
    @Res({ passthrough: true }) response: Response,
  ) {
    const session = await this.authService.login(data);
    return this.sendSession(response, session);
  }

  @Post('logout')
  @HttpCode(HttpStatus.NO_CONTENT)
  logout(@Res({ passthrough: true }) response: Response) {
    response.clearCookie(AUTH_COOKIE_NAME, this.cookieOptions);
  }

  @Get('session')
  @UseGuards(AuthGuard)
  getSession(@CurrentUser() user: AuthenticatedUser) {
    return this.authService.getSession(user);
  }

  private sendSession<T>(
    response: Response,
    session: { accessToken: string; user: T; expiresIn: number },
  ) {
    response.cookie(AUTH_COOKIE_NAME, session.accessToken, {
      ...this.cookieOptions,
      maxAge: SESSION_DURATION_MS,
    });

    return { user: session.user, expiresIn: session.expiresIn };
  }

  private get cookieOptions(): CookieOptions {
    return {
      httpOnly: true,
      secure: this.configService.get<string>('NODE_ENV') === 'production',
      sameSite: 'lax',
      path: '/',
    };
  }
}
