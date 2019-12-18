import { Context } from 'koa';
import pg from 'pg';

import { redis } from './redis';

describe('redis', () => {
  process.env.REDIS_URL = 'redis://';
  let ctx: {
    status?: number;
    redis?: any,
  };

  beforeEach(() => { ctx = {}; });

  it('should correctly setup redis', async () => {
    await redis(ctx as Context, async () => { ctx.status = 200; });

    expect(ctx.redis).toBeDefined();
    expect(ctx.redis).toHaveProperty('quit');
    expect(ctx.status).toBe(200);
  });
});
