import { Controller, Get, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('users')
export class UsersController {
  @Get()
  @UseGuards(JwtAuthGuard)
  getUsers() {
    return {
      message: 'Protected route accessed successfully!',
    };
  }
}