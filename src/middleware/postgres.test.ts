import { Context } from 'koa';
import pg from 'pg';

import { postgres } from './postgres';

describe('postgres', () => {
  let ctx: {
    status?: number;
    db?: any,
  };

  beforeEach(() => { ctx = {}; });

  it('should correctly setup logger', async () => {
    class MyClient extends pg.Client {
      public connect = jest.fn();
      public end = jest.fn();
    }
    pg.Client = MyClient;

    await postgres(ctx as Context, async () => { ctx.status = 200; });

    expect(ctx.db).toBeDefined();
    expect(ctx.db).toHaveProperty('query');
    expect(ctx.status).toBe(200);
  });
});
