import { Context } from 'koa';
import { Client } from 'pg';

import { expectEnvironmentVariable } from './environment';

export async function postgres(ctx: Context, next: () => Promise<any>) {
  ctx.db = new Client({
    connectionString: expectEnvironmentVariable('DATABASE_URL'),
    statement_timeout: 1000,
    connectionTimeoutMillis: 1000,
  });

  await ctx.db.connect();
  await next();
  await ctx.db.end();
}
