import postgres from '@prisma/orm-postgres/runtime';
import { contractFromJson } from '@prisma/orm-postgres/static';
import type { Contract } from './generated/contract.js';
import contractJson from './generated/contract.json' with { type: 'json' };

export const contract = contractFromJson<Contract>(contractJson);

export const createPrismaDb = (url: string) => postgres({ contract, url });

export type PrismaDb = ReturnType<typeof createPrismaDb>;
