import { Context } from 'koa';

export interface IHealthcheckResponse {
  readonly status: number;
  readonly body: {
    readonly status: string;
  };
}

export async function getHealthcheck(_ctx: Context): Promise<IHealthcheckResponse> {
  return {
    status: 200,
    body: {
      status: 'OK',
    },
  };
}
