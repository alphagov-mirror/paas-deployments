import { Context } from 'koa';

import { handle } from './handler';

describe('actions handler', () => {
  interface IContext {
    status?: number;
    body?: any;
  }

  it('should handle action returning json', async () => {
    const ctx: IContext = {};

    const fn = handle(async (_ctx: Context) => {
      return {
        status: 202,
        body: {object: 'accepted'},
      };
    });
    await fn(ctx as Context, async () => null);

    expect(ctx.status).toEqual(202);
    expect(ctx.body).toHaveProperty('object');
  });

  it('should handle action returning text', async () => {
    const ctx: IContext = {};

    const fn = handle(async (_ctx: Context) => {
      return {
        status: 201,
        body: '<p>Created</p>',
      };
    });
    await fn(ctx as Context, async () => null);

    expect(ctx.status).toEqual(201);
    expect(ctx.body).toContain('<p>');
  });

  it('should handle action with no status provided', async () => {
    const ctx: IContext = {};

    const fn = handle(async (_ctx: Context) => {
      return {
        body: {status: `all's good`},
      };
    });
    await fn(ctx as Context, async () => null);

    expect(ctx.status).toEqual(200);
  });

  it('should handle action with no body provided', async () => {
    const ctx: IContext = {};

    const fn = handle(async (_ctx: Context) => {
      return {
        status: 404,
      };
    });
    await fn(ctx as Context, async () => null);

    expect(ctx.body).toHaveLength(0);
  });
});
