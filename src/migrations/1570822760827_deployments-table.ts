/* eslint-disable @typescript-eslint/camelcase */
import { MigrationBuilder, Value } from 'node-pg-migrate';

import { DeploymentTrigger } from '../repository';

export const shorthands = undefined;

export async function up(pgm: MigrationBuilder): Promise<void> {
  const allowedTypes: ReadonlyArray<DeploymentTrigger> = ['branch', 'release', 'manual'];
  pgm.createType('deployment_trigger', allowedTypes as Value[]);

  pgm.createTable('deployments', {
    guid: { type: 'uuid', primaryKey: true },
    repository: { type: 'varchar(512)', notNull: true },
    branch: { type: 'varchar(62)', notNull: true },
    trigger: { type: 'deployment_trigger', default: 'manual' },
    organizationGUID: { type: 'uuid', notNull: true },
    spaceGUID: { type: 'uuid', notNull: true },
    createdAt: { type: 'timestamp', notNull: true, default: pgm.func('current_timestamp') },
    updatedAt: { type: 'timestamp', notNull: true, default: pgm.func('current_timestamp') },
    deletedAt: { type: 'timestamp', default: null },
  });

  pgm.createIndex('deployments', 'organizationGUID');
}

export async function down(pgm: MigrationBuilder): Promise<void> {
  pgm.dropIndex('deployments', 'organizationGUID');
  pgm.dropTable('deployments');
  pgm.dropType('deployment_trigger');
}
