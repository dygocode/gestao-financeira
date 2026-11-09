import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createPrismaDb } from './db.js';
import { PRISMA_DB } from './prisma.constants.js';

@Module({
  providers: [
    {
      provide: PRISMA_DB,
      inject: [ConfigService],
      useFactory: (configService: ConfigService) =>
        createPrismaDb(configService.getOrThrow<string>('DATABASE_URL')),
    },
  ],
  exports: [PRISMA_DB],
})
export class PrismaModule {}
