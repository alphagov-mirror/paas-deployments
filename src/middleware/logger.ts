import { Context } from 'koa';
import winston from 'winston';

export async function logger(ctx: Context, next: () => Promise<any>) {
  ctx.log = winston.createLogger({
    level: process.env.DEBUG === 'true' ? 'debug' : 'warn',
    format: winston.format.json(),
    defaultMeta: { service: 'paas-deployments' },
    transports: [
      new winston.transports.Console(),
    ],
  });

  await next();
}
