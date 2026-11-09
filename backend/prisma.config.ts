import { config as loadEnv } from 'dotenv';
import { definePrismaConfig } from '@prisma/cli-engine';
import { defineConfig as ormConfig } from '@prisma/orm-postgres/config';

const environment = process.env['NODE_ENV'] ?? 'development';

loadEnv({
  path: [`.env.${environment}.local`, `.env.${environment}`, '.env'],
  quiet: true,
});

export default definePrismaConfig({
  orm: ormConfig({
    contract: './prisma/contract.prisma',
    output: './src/prisma/generated',
    migrations: {
      dir: './prisma/migrations',
    },
    db: {
      connection: process.env['DATABASE_URL']!,
    },
  }),
});
