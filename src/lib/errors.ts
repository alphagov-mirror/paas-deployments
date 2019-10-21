import { Context } from 'koa';

import { NotFound } from './errors.notfound';

export { NotFound } from './errors.notfound';

export async function captureErrors(ctx: Context, next: () => Promise<any>) {
  try {
    await next();
  } catch (err) {
    await handleErrors(err, ctx);
  }
}

export async function handleErrors(err: any, ctx: Context) {
  const date = new Date();
  const reference = { reference: `paas-deployments-${date.getTime()}` };

  if (err instanceof NotFound) {
    ctx.status = 404;
    ctx.body = { message: err.message, ...reference };
    ctx.log.debug({ message: err.message, ...reference });
    return;
  }

  ctx.status = 500;
  ctx.body = { message: 'Internal server error', ...reference };
  ctx.log.error({ message: err.message, ...reference });
}
