import { Context } from 'koa';

export interface IPaginationMetadata {
  readonly current: number;
  readonly limit: number;
  readonly next?: string;
  readonly pages: number;
  readonly previous?: string;
  readonly results: number;
}

export interface IPaginatedData<T> {
  readonly pagination: IPaginationMetadata;
  readonly data: ReadonlyArray<T>;
}

export interface IPaginationParametes {
  readonly limit?: number;
  readonly page?: number;
}

interface IConfig {
  readonly current: number;
  readonly limit: number;
  readonly pages: number;
  readonly results: number;
}

export function generatePaginationMetadata(
  ctx: Context,
  list: string,
  { current, limit, pages, results }: IConfig,
): IPaginationMetadata {
  const prev = current - 1;
  const next = current + 1;

  return {
    current,
    limit,
    previous: prev > 0 ? ctx.router.url(list, {query: {...ctx.query, page: prev > 1 ? prev : undefined}}) : undefined,
    next: next <= pages ? ctx.router.url(list, {query: {...ctx.query, page: next}}) : undefined,
    pages,
    results,
  };
}
