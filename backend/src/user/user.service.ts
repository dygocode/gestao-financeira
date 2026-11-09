import { Inject, Injectable } from '@nestjs/common';

import type { PrismaDb } from '../prisma/db.js';
import { PRISMA_DB } from '../prisma/prisma.constants.js';

@Injectable()
export class UserService {
  constructor(@Inject(PRISMA_DB) private readonly prisma: PrismaDb) {}

  async findById(id: number) {
    return this.prisma.orm.public.User.whereUnique({ id })
      .select('id', 'email', 'username', 'name', 'createdAt', 'updatedAt')
      .first();
  }

  async findCredentialsByEmail(email: string) {
    return this.prisma.orm.public.User.whereUnique({ email })
      .select(
        'id',
        'email',
        'username',
        'name',
        'passwordHash',
        'createdAt',
        'updatedAt',
      )
      .first();
  }

  async createWithPassword(data: {
    email: string;
    name: string;
    passwordHash: string;
  }) {
    return this.prisma.orm.public.User.select(
      'id',
      'email',
      'username',
      'name',
      'createdAt',
      'updatedAt',
    ).create({
      email: data.email,
      name: data.name,
      passwordHash: data.passwordHash,
    });
  }
}
