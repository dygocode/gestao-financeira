import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';

import { UserService } from './user.service.js';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UserService) {}

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.findById(id);
  }
}
