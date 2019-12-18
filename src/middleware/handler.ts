import { Context, Middleware } from 'koa';

import { IAction } from './types';

export function handle<T>(action: (ctx: Context) => Promise<IAction<T>>): Middleware {
  return async (ctx: Context, _next: () => {}) => {
    const response = await action(ctx);

    ctx.status = response.status || 200;
    ctx.body = response.body || [];
  };
}
