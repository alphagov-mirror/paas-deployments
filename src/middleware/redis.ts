import { Context } from 'koa';
import { createClient } from 'redis';

import { expectEnvironmentVariable } from './environment';

export async function redis(ctx: Context, next: () => Promise<any>) {
  ctx.redis = createClient(expectEnvironmentVariable('REDIS_URL'));

  await next();
  await ctx.redis.quit();
}
