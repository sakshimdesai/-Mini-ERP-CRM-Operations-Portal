import { Controller, Post, Body, Get, Req, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { RolesGuard } from './guards/roles/roles.guard';
import { Roles } from './decorators/roles.decorator';

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

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Admin')
  @Get('admin')
  admin(@Req() req: any) {
    return {
      message: 'Welcome Admin',
      user: req.user,
    };
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Sales')
  @Get('sales')
  sales(@Req() req: any) {
    return {
      message: 'Welcome Sales',
      user: req.user,
    };
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Warehouse')
  @Get('warehouse')
  warehouse(@Req() req: any) {
    return {
      message: 'Welcome Warehouse',
      user: req.user,
    };
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Accounts')
  @Get('accounts')
  accounts(@Req() req: any) {
    return {
      message: 'Welcome Accounts',
      user: req.user,
    };
  }
}