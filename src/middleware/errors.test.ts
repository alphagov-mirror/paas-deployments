import { Context } from 'koa';

import * as errors from './errors';

describe('errors', () => {
  let ctx: {
    status?: number;
    body?: any;
    log?: { debug: () => void, error: () => void },
  };

  beforeEach(() => {
    ctx = {
      status: 200,
      log: { debug: () => null, error: () => null },
    };
  });

  it('should correctly determine 404', async () => {
    await errors.handleErrors(new errors.NotFound('test'), ctx as Context);

    expect(ctx.status).toEqual(404);
    expect(ctx.body).toHaveProperty('reference');
    expect(ctx.body).toHaveProperty('message');
  });

  it('should correctly determine 422', async () => {
    await errors.handleErrors(new errors.ValidationError('test', []), ctx as Context);

    expect(ctx.status).toEqual(422);
    expect(ctx.body).toHaveProperty('reference');
    expect(ctx.body).toHaveProperty('message');
    expect(ctx.body).toHaveProperty('errors');
  });

  it('should correctly determine all errors', async () => {
    await errors.handleErrors(new Error('test'), ctx as Context);

    expect(ctx.status).toEqual(500);
    expect(ctx.body).toHaveProperty('reference');
    expect(ctx.body).toHaveProperty('message');
  });

  it('should successfully capture errors', async () => {
    await expect(errors.captureErrors(ctx as Context, () => {
      throw new errors.NotFound('TEST');
    })).resolves.not.toThrowError();
  });
});
