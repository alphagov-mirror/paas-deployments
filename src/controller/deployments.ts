import { Context } from 'koa';

import { IAction, NotFound, ValidationError } from '../middleware';
import * as repository from '../repository';
import { generatePaginationMetadata, IPaginatedData } from './pagination';
import { validateDeployment } from './validation';

function fromQueryOrDefault(s: string, defaultValue: number): number {
  const i = parseInt(s, 10) || defaultValue;
  return i > 0 ? i : defaultValue;
}

export async function listDeployments(ctx: Context): Promise<IAction<IPaginatedData<repository.IDeploymentEntity>>> {
  const current = fromQueryOrDefault(ctx.query.page, 1);
  const limit = fromQueryOrDefault(ctx.query.limit, 10);
  const query = {
    page: current,
    limit,
    organization: ctx.query.organization,
    space: ctx.query.space,
  };

  const [results, deployments] = await Promise.all([
    repository.countDeployments(ctx.db, query),
    repository.listDeployments(ctx.db, query),
  ]);
  const pages = Math.ceil(results / limit);

  return {
    status: results > 0 && pages >= current ? 200 : 404,
    body: {
      pagination: generatePaginationMetadata(ctx, 'deployment.list', { current, limit, pages, results }),
      data: deployments,
    },
  };
}

export async function getDeployment(ctx: Context): Promise<IAction<repository.IDeploymentEntity>> {
  const deployment = await repository.fetchDeployment(ctx.db, { guid: ctx.params.deploymentGUID });
  if (deployment === undefined) {
    throw new NotFound('Deployment not found');
  }

  return {
    status: 200,
    body: deployment,
  };
}

export async function postDeployment(ctx: Context): Promise<IAction<repository.IDeploymentEntity>> {
  const deployment: repository.IDeployment = {
    repository: ctx.request.body.repository || '',
    branch: ctx.request.body.branch || 'master',
    trigger: ctx.request.body.trigger || 'manual',
    organizationGUID: ctx.request.body.organizationGUID || '',
    spaceGUID: ctx.request.body.spaceGUID || '',
  };

  const validationErrors = await validateDeployment(deployment);
  if (validationErrors.length > 0) {
    throw new ValidationError('Invalid payload provided', validationErrors);
  }

  return {
    status: 202,
    body: await repository.createDeployment(ctx.db, ctx.redis, deployment),
  };
}

export async function putDeployment(ctx: Context): Promise<IAction<repository.IDeploymentEntity>> {
  const deployment: repository.IDeployment = {
    repository: ctx.request.body.repository || '',
    branch: ctx.request.body.branch || 'master',
    trigger: ctx.request.body.trigger || 'manual',
    organizationGUID: ctx.request.body.organizationGUID || '',
    spaceGUID: ctx.request.body.spaceGUID || '',
  };

  const validationErrors = await validateDeployment(deployment);
  if (validationErrors.length > 0) {
    throw new ValidationError('Invalid payload provided', validationErrors);
  }

  if (await repository.fetchDeployment(ctx.db, { guid: ctx.params.deploymentGUID }) === undefined) {
    throw new NotFound('Deployment not found');
  }

  return {
    status: 200,
    body: await repository.updateDeployment(ctx.db, ctx.redis, { guid: ctx.params.deploymentGUID }, deployment),
  };
}

export async function deleteDeployment(ctx: Context): Promise<IAction<repository.IDeploymentEntity>> {
  const deployment = await repository.deleteDeployment(ctx.db, ctx.redis, { guid: ctx.params.deploymentGUID });

  if (!deployment) {
    throw new NotFound('Deployment not found');
  }

  return {
    status: 204,
  };
}
