import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  async login(@Body() credentials: { username: string; password: string }) {
    const user = await this.authService.validateUser(
      credentials.username,
      credentials.password,
    );
    return this.authService.login(user);
  }
}