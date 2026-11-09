import { Inject, Injectable } from '@nestjs/common';

import type { PrismaDb } from '../prisma/db.js';
import { PRISMA_DB } from '../prisma/prisma.constants.js';

@Injectable()
export class UserService {
  constructor(@Inject(PRISMA_DB) private readonly prisma: PrismaDb) {}

  async findById(id: number) {
    return this.prisma.orm.public.User.whereUnique({
      id,
    });
  }

  async findByEmail(email: string) {
    return this.prisma.orm.public.User.whereUnique({
      email,
    });
  }

  async createWithPassword(data: {
    email: string;
    name: string;
    passwordHash: string;
  }) {
    return this.prisma.orm.public.User.create({
      email: data.email,
      name: data.name,
      passwordHash: data.passwordHash,
    });
  }
}
