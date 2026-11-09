#!/usr/bin/env -S node
import type { Contract as Start } from '../../snapshots/5660bbc9dd6e08a2a73a277f41dc16ac630a969396d2a04520854bea0f79a0b2/contract';
import startContract from '../../snapshots/5660bbc9dd6e08a2a73a277f41dc16ac630a969396d2a04520854bea0f79a0b2/contract.json' with { type: 'json' };
import type { Contract as End } from '../../snapshots/bd9aa9665d85a46ec31848d6fea125ac14cffc2dd726e7e3e1b9e3ebbbb01c48/contract';
import endContract from '../../snapshots/bd9aa9665d85a46ec31848d6fea125ac14cffc2dd726e7e3e1b9e3ebbbb01c48/contract.json' with { type: 'json' };
import { Migration, MigrationCLI } from '@prisma/orm-postgres/migration';

export default class M extends Migration<Start, End> {
  override readonly startContractJson = startContract;
  override readonly endContractJson = endContract;

  override get operations() {
    return [this.dropColumn({ schema: 'public', table: 'User', column: 'username' })];
  }
}

MigrationCLI.run(import.meta.url, M);
