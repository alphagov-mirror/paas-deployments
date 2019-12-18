import { Client, QueryResult } from 'pg';
import { v4 as uuid } from 'uuid';

import { IWithGUID, IWithTimestamps } from './entity';

export type DeploymentTrigger = 'branch' | 'release' | 'manual' | string;

export interface IDeployment {
  readonly repository: string;
  readonly branch?: string;
  readonly trigger: DeploymentTrigger;
  readonly organizationGUID: string;
  readonly spaceGUID: string;
}

export interface IDeploymentEntity extends IWithGUID, IDeployment, IWithTimestamps {}

interface IQuery {
  readonly limit: number;
  readonly page: number;
  readonly organization?: string;
  readonly space?: string;
}

interface ITotal {
  readonly total: number;
}

const deploymentsTable = 'deployments';
const nullGUID = 'a0000000-a000-0000-a000-a00000000000';

export async function countDeployments(db: Client, filter: IQuery): Promise<number> {
  const result: QueryResult<ITotal> = await db.query({
    name: 'count-deployments',
    text: `SELECT COUNT(guid)::integer as total FROM ${deploymentsTable} WHERE "deletedAt" IS NULL AND
      ($1::uuid = '${nullGUID}' OR "organizationGUID" = $1) AND ($2::uuid = '${nullGUID}' OR "spaceGUID" = $2)`,
    values: [
      filter.organization || nullGUID,
      filter.space || nullGUID,
    ],
  });

  return result.rows[0].total;
}

export async function listDeployments(db: Client, filter: IQuery): Promise<ReadonlyArray<IDeploymentEntity>> {
  const result: QueryResult<IDeploymentEntity> = await db.query({
    name: 'list-deployments',
    text: `SELECT guid, repository, branch, trigger, "organizationGUID", "spaceGUID", "createdAt", "updatedAt"
      FROM ${deploymentsTable} WHERE "deletedAt" IS NULL AND
      ($1::uuid = '${nullGUID}' OR "organizationGUID" = $1) AND ($2::uuid = '${nullGUID}' OR "spaceGUID" = $2) LIMIT $3 OFFSET $4`,
    values: [
      filter.organization || nullGUID,
      filter.space || nullGUID,
      filter.limit,
      (filter.page - 1) * filter.limit,
    ],
  });

  return result.rows;
}

export async function fetchDeployment(db: Client, filter: IWithGUID): Promise<IDeploymentEntity | undefined> {
  const result: QueryResult<IDeploymentEntity> = await db.query({
    name: 'fetch-deployment',
    text: `SELECT guid, repository, branch, trigger, "organizationGUID", "spaceGUID", "createdAt", "updatedAt"
      FROM ${deploymentsTable} WHERE guid = $1 AND "deletedAt" IS NULL`,
    values: [filter.guid],
  });

  return result.rows[0];
}

export async function createDeployment(db: Client, data: IDeployment): Promise<IDeploymentEntity> {
  const guid = uuid();

  const result: QueryResult<IDeploymentEntity> = await db.query({
    name: 'create-deployment',
    text: `INSERT INTO ${deploymentsTable}(guid, repository, branch, trigger, "organizationGUID", "spaceGUID") VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING guid, repository, branch, trigger, "organizationGUID", "spaceGUID", "createdAt", "updatedAt"`,
    values: [
      guid,
      data.repository,
      data.branch,
      data.trigger,
      data.organizationGUID,
      data.spaceGUID,
    ],
  });

  return result.rows[0];
}

export async function updateDeployment(db: Client, filter: IWithGUID, data: IDeployment): Promise<IDeploymentEntity> {
  const result: QueryResult<IDeploymentEntity> = await db.query({
    name: 'update-deployment',
    text: `UPDATE ${deploymentsTable} SET repository = $1, branch = $2, trigger = $3, "organizationGUID" = $4, "spaceGUID" = $5, "updatedAt" = $6 WHERE guid = $7
      RETURNING guid, repository, branch, trigger, "organizationGUID", "spaceGUID", "createdAt", "updatedAt"`,
    values: [
      data.repository,
      data.branch,
      data.trigger,
      data.organizationGUID,
      data.spaceGUID,
      new Date(),
      filter.guid,
    ],
  });

  return result.rows[0];
}

export async function deleteDeployment(db: Client, filter: IWithGUID): Promise<IDeploymentEntity> {
  const result: QueryResult<IDeploymentEntity> = await db.query({
    name: 'delete-deployment',
    text: `UPDATE ${deploymentsTable} SET "deletedAt" = $1 WHERE guid = $2 AND "deletedAt" IS NULL
      RETURNING guid, repository, branch, trigger, "organizationGUID", "spaceGUID", "createdAt", "updatedAt", "deletedAt"`,
    values: [
      new Date(),
      filter.guid,
    ],
  });

  const deployment = result.rows[0];
  if (!deployment) {
    return;
  }

  return deployment;
}
