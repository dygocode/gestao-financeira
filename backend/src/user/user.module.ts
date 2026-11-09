import { Module } from '@nestjs/common';
import { UserService } from './user.service.js';
import { PrismaModule } from '../prisma/prisma.module.js';
import { UsersController } from './user.controller.js';

@Module({
  imports: [PrismaModule],
  controllers: [UsersController],
  providers: [UserService],
  exports: [UserService],
})
export class UserModule {}
