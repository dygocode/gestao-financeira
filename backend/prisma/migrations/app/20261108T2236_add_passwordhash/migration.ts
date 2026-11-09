#!/usr/bin/env -S node
import type { Contract as End } from '../../snapshots/5660bbc9dd6e08a2a73a277f41dc16ac630a969396d2a04520854bea0f79a0b2/contract';
import endContract from '../../snapshots/5660bbc9dd6e08a2a73a277f41dc16ac630a969396d2a04520854bea0f79a0b2/contract.json' with { type: 'json' };
import type { Contract as Start } from '../../snapshots/b1a8734d842613d3d915317b86bc81b64860da5e03da7b86bddddebe2b74818e/contract';
import startContract from '../../snapshots/b1a8734d842613d3d915317b86bc81b64860da5e03da7b86bddddebe2b74818e/contract.json' with { type: 'json' };
import { Migration, MigrationCLI, sql } from '@prisma/orm-postgres/migration';

export default class M extends Migration<Start, End> {
  override readonly startContractJson = startContract;
  override readonly endContractJson = endContract;

  override get operations() {
    return [
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
