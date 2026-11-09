#!/usr/bin/env -S node
import type { Contract as Start } from '../../snapshots/b1a8734d842613d3d915317b86bc81b64860da5e03da7b86bddddebe2b74818e/contract';
import startContract from '../../snapshots/b1a8734d842613d3d915317b86bc81b64860da5e03da7b86bddddebe2b74818e/contract.json' with { type: 'json' };
import type { Contract as End } from '../../snapshots/bd9aa9665d85a46ec31848d6fea125ac14cffc2dd726e7e3e1b9e3ebbbb01c48/contract';
import endContract from '../../snapshots/bd9aa9665d85a46ec31848d6fea125ac14cffc2dd726e7e3e1b9e3ebbbb01c48/contract.json' with { type: 'json' };
import { Migration, MigrationCLI, sql } from '@prisma/orm-postgres/migration';

export default class M extends Migration<Start, End> {
  override readonly startContractJson = startContract;
  override readonly endContractJson = endContract;

  override get operations() {
    return [
      this.dropColumn({ schema: 'public', table: 'User', column: 'username' }),
      this.addColumnWithTemporaryDefault({
        schema: 'public',
        table: 'User',
        column: 'passwordHash',
        type: 'text',
        temporaryDefault: sql`''`,
      }),
    ];
  }
}

MigrationCLI.run(import.meta.url, M);
