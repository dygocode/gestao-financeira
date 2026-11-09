import { config as loadEnv } from 'dotenv';
import * as argon2 from 'argon2';
import { createPrismaDb } from './db.js';

const ADMIN_EMAIL = 'demo@fintech.com';
const ADMIN_NAME = 'demo';
const DEFAULT_ADMIN_PASSWORD = 'Demo@123';

const environment = process.env['NODE_ENV'] ?? 'development';

loadEnv({
  path: [`.env.${environment}.local`, `.env.${environment}`, '.env'],
  quiet: true,
});

async function seed() {
  const databaseUrl = process.env['DATABASE_URL'];

  if (!databaseUrl) {
    throw new Error('DATABASE_URL não configurada para executar o seed');
  }

  const password = process.env['SEED_ADMIN_PASSWORD'] ?? DEFAULT_ADMIN_PASSWORD;
  const db = createPrismaDb(databaseUrl);
  const existingUser = await db.orm.public.User.whereUnique({
    email: ADMIN_EMAIL,
  })
    .select('id', 'name', 'passwordHash')
    .first();

  if (!existingUser) {
    const passwordHash = await argon2.hash(password);
    const user = await db.orm.public.User.select('id', 'email', 'name').create({
      email: ADMIN_EMAIL,
      name: ADMIN_NAME,
      passwordHash,
    });

    console.info(`Usuário inicial criado: ${user.email} (id: ${user.id})`);
    return;
  }

  const passwordMatches = await verifyPassword(
    existingUser.passwordHash,
    password,
  );

  if (existingUser.name === ADMIN_NAME && passwordMatches) {
    console.info(`Usuário inicial já está configurado: ${ADMIN_EMAIL}`);
    return;
  }

  const changes: { name?: string; passwordHash?: string } = {};
  if (existingUser.name !== ADMIN_NAME) changes.name = ADMIN_NAME;
  if (!passwordMatches) changes.passwordHash = await argon2.hash(password);

  await db.orm.public.User.whereUnique({ id: existingUser.id }).update(changes);
  console.info(`Usuário inicial atualizado: ${ADMIN_EMAIL}`);
}

async function verifyPassword(hash: string, password: string) {
  try {
    return await argon2.verify(hash, password);
  } catch {
    return false;
  }
}

seed()
  .then(() => process.exit(0))
  .catch((error: unknown) => {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`Falha ao executar seed: ${message}`);
    process.exit(1);
  });
