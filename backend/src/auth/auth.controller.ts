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
import { CsrfGuard } from './csrf.guard.js';

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
  @UseGuards(AuthGuard, CsrfGuard)
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
    session: {
      accessToken: string;
      user: T;
      expiresIn: number;
      csrfToken: string;
    },
  ) {
    response.cookie(AUTH_COOKIE_NAME, session.accessToken, {
      ...this.cookieOptions,
      maxAge: SESSION_DURATION_MS,
    });

    return {
      user: session.user,
      expiresIn: session.expiresIn,
      csrfToken: session.csrfToken,
    };
  }

  private get cookieOptions(): CookieOptions {
    const isProduction =
      this.configService.get<string>('NODE_ENV') === 'production';

    return {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? 'none' : 'lax',
      path: '/',
    };
  }
}
