import { Context } from 'koa';
import { QueryConfig, QueryResult } from 'pg';

import { IDeployment } from '../repository';
import * as action from './deployments';

function fakeQuery(data: any) {
  return (_: QueryConfig): QueryResult => {
    return {command: '', fields: [], rowCount: data ? data.length : 0, rows: data, oid: 0};
  };
}

describe('deployment actions', () => {
  describe('obtain single entity', () => {
    interface IContext {
      db?: any;
      params?: {deploymentGUID: string};
    }

    it('should respond with status OK', async () => {
      const ctx: IContext = {
        db: {
          query: fakeQuery([
            {
              guid: 'aa000a0a-a000-000a-aa00-a0a00a0a0a00',
              repository: 'https://example.com/',
              trigger: 'manual',
            },
          ]),
        },
        params: {
          deploymentGUID: 'aa000a0a-a000-000a-aa00-a0a00a0a0a00',
        },
      };

      const response = await action.getDeployment(ctx as Context);

      expect(response.status).toEqual(200);
      expect(response.body).toHaveProperty('repository');
      expect(response.body).toHaveProperty('trigger');
    });

    it('should respond with status Not Found', async () => {
      const ctx: IContext = {
        db: { query: fakeQuery([]) },
        params: {
          deploymentGUID: 'not-found',
        },
      };

      await expect(action.getDeployment(ctx as Context)).rejects.toThrowError(/Deployment not found/);
    });
  });

  describe('obtain list of entities', () => {
    interface IContext {
      db?: any;
      query: {[key: string]: any};
      router: {
        url: (name: string, params: object, data: object) => string;
      };
    }

    it('should respond with status OK', async () => {
      const ctx: IContext = {
        db: {
          query: (q: QueryConfig): QueryResult => {
            switch (q.name) {
              case 'list-deployments':
                return { command: '', oid: 0, fields: [], rowCount: 2, rows: [
                  {
                    guid: 'aa000a0a-a000-000a-aa00-a0a00a0a0a00',
                    repository: 'https://example.com/',
                    trigger: 'manual',
                  },
                  {
                    guid: 'bb111b1b-b111-111b-bb11-b1b11b1b1b11',
                    repository: 'https://example.com/',
                    branch: 'master',
                    trigger: 'branch',
                  },
                ]};
              case 'count-deployments':
                return {command: '', fields: [], rowCount: 1, rows: [{ total: 12 }], oid: 0};
              default:
                throw new Error('not expected');
            }
          },
        },
        query: {
          limit: 10,
          page: 2,
        },
        router: { url: () => '' },
      };

      const response = await action.listDeployments(ctx as unknown as Context);

      expect(response.status).toEqual(200);
      expect(response.body).toHaveProperty('pagination');
      expect(response.body && response.body.pagination.current).toEqual(2);
      expect(response.body && response.body.pagination.pages).toEqual(2);
      expect(response.body && response.body.pagination.results).toEqual(12);

      expect(response.body).toHaveProperty('data');
      expect(response.body && response.body.data[1].guid).toEqual('bb111b1b-b111-111b-bb11-b1b11b1b1b11');
      expect(response.body && response.body.data[1].repository).toEqual('https://example.com/');
      expect(response.body && response.body.data[1].branch).toEqual('master');
      expect(response.body && response.body.data[1].trigger).toEqual('branch');
    });

    it('should respond with status OK when between pages', async () => {
      const ctx: IContext = {
        db: {
          query: (q: QueryConfig): QueryResult => {
            switch (q.name) {
              case 'list-deployments':
                return { command: '', oid: 0, fields: [], rowCount: 2, rows: [
                  {
                    guid: 'aa000a0a-a000-000a-aa00-a0a00a0a0a00',
                    repository: 'https://example.com/',
                    trigger: 'manual',
                  },
                  {
                    guid: 'bb111b1b-b111-111b-bb11-b1b11b1b1b11',
                    repository: 'https://example.com/',
                    branch: 'master',
                    trigger: 'branch',
                  },
                ]};
              case 'count-deployments':
                return {command: '', fields: [], rowCount: 1, rows: [{ total: 6 }], oid: 0};
              default:
                throw new Error('not expected');
            }
          },
        },
        query: {
          limit: 2,
          page: 2,
          organization: 'aa000a0a-a000-000a-aa00-a0a00a0a0a00',
        },
        router: { url: () => '' },
      };

      const response = await action.listDeployments(ctx as unknown as Context);

      expect(response.status).toEqual(200);
      expect(response.body).toHaveProperty('pagination');
      expect(response.body && response.body.pagination.current).toEqual(2);
      expect(response.body && response.body.pagination.pages).toEqual(3);
      expect(response.body && response.body.pagination.previous).toBeDefined();
      expect(response.body && response.body.pagination.next).toBeDefined();
      expect(response.body && response.body.pagination.results).toEqual(6);

      expect(response.body).toHaveProperty('data');
      expect(response.body && response.body.data[1].guid).toEqual('bb111b1b-b111-111b-bb11-b1b11b1b1b11');
      expect(response.body && response.body.data[1].repository).toEqual('https://example.com/');
      expect(response.body && response.body.data[1].branch).toEqual('master');
      expect(response.body && response.body.data[1].trigger).toEqual('branch');
    });

    it('should respond with status Not Found on page number out of bounds', async () => {
      const ctx: IContext = {
        db: {
          query: (q: QueryConfig): QueryResult => {
            switch (q.name) {
              case 'count-deployments':
                return {command: '', fields: [], rowCount: 1, rows: [{ total: 12 }], oid: 0};
              default:
                return {command: '', fields: [], rowCount: 1, rows: [], oid: 0};
            }
          },
        },
        query: {
          page: 3,
        },
        router: { url: () => '' },
      };

      const response = await action.listDeployments(ctx as unknown as Context);

      expect(response.status).toEqual(404);
      expect(response.body).toHaveProperty('pagination');
      expect(response.body && response.body.pagination.current).toEqual(3);
      expect(response.body && response.body.pagination.pages).toEqual(2);
      expect(response.body && response.body.pagination.results).toEqual(12);

      expect(response.body).toHaveProperty('data');
      expect(response.body && response.body.data).toHaveLength(0);
    });

    it('should respond despite insane query parameters', async () => {
      const ctx1: IContext = {
        db: {
          query: (q: QueryConfig): QueryResult => {
            switch (q.name) {
              case 'count-deployments':
                return {command: '', fields: [], rowCount: 1, rows: [{ total: 0 }], oid: 0};
              default:
                return {command: '', fields: [], rowCount: 1, rows: [], oid: 0};
            }
          },
        },
        query: { page: -5 },
        router: { url: () => '' },
      };

      const response1 = await action.listDeployments(ctx1 as unknown as Context);

      expect(response1.status).toEqual(404);
      expect(response1.body).toHaveProperty('pagination');
      expect(response1.body && response1.body.pagination.current).toEqual(1);
      expect(response1.body && response1.body.pagination.results).toEqual(0);

      const ctx2: IContext = {
        db: {
          query: (q: QueryConfig): QueryResult => {
            switch (q.name) {
              case 'count-deployments':
                return {command: '', fields: [], rowCount: 1, rows: [{ total: 0 }], oid: 0};
              default:
                return {command: '', fields: [], rowCount: 1, rows: [], oid: 0};
            }
          },
        },
        query: { limit: -10 },
        router: { url: () => '' },
      };

      const response2 = await action.listDeployments(ctx2 as unknown as Context);

      expect(response2.status).toEqual(404);
      expect(response2.body).toHaveProperty('pagination');
      expect(response2.body && response2.body.pagination.current).toEqual(1);
      expect(response2.body && response2.body.pagination.results).toEqual(0);
    });
  });

  describe('create new entity', () => {
    interface IContext {
      db?: any;
      request?: {body: IDeployment | object};
    }

    it('should respond with status Accepted', async () => {
      const ctx: IContext = {
        db: {
          query: fakeQuery([
            {
              guid: 'aa000a0a-a000-000a-aa00-a0a00a0a0a00',
              repository: 'https://example.com/',
              branch: null,
              trigger: 'manual',
              organizationGUID: 'aa000a0a-a000-000a-aa00-a0a00a0a0a00',
              spaceGUID: 'aa000a0a-a000-000a-aa00-a0a00a0a0a00',
              createdAt: new Date(),
              updatedAt: new Date(),
              deletedAt: null,
            },
          ]),
        },
        request: {
          body: {
            repository: 'https://example.com/',
            trigger: 'manual',
            organizationGUID: 'aa000a0a-a000-000a-aa00-a0a00a0a0a00',
            spaceGUID: 'aa000a0a-a000-000a-aa00-a0a00a0a0a00',
          },
        },
      };

      const response = await action.postDeployment(ctx as Context);

      expect(response.status).toEqual(202);
      expect(response.body).toHaveProperty('repository');
      expect(response.body).toHaveProperty('trigger');
    });

    it('should respond with status 422 due to invalid data provided', async () => {
      const ctx: IContext = {
        db: { query: fakeQuery([]) },
        request: {
          body: {},
        },
      };

      await expect(action.postDeployment(ctx as Context)).rejects.toThrowError(/Invalid payload provided/);
    });
  });

  describe('update entity', () => {
    interface IContext {
      db?: any;
      request?: {body: IDeployment | object};
      params?: {deploymentGUID: string};
    }

    it('should respond with status OK', async () => {
      const ctx: IContext = {
        db: {
          query: (q: QueryConfig): QueryResult => {
            switch (q.name) {
              case 'fetch-deployment':
                return { command: '', oid: 0, fields: [], rowCount: 2, rows: [
                  {
                    guid: 'aa000a0a-a000-000a-aa00-a0a00a0a0a00',
                    repository: 'https://example.net/',
                    branch: null,
                    trigger: 'manual',
                    organizationGUID: 'aa000a0a-a000-000a-aa00-a0a00a0a0a00',
                    spaceGUID: 'aa000a0a-a000-000a-aa00-a0a00a0a0a00',
                    createdAt: new Date(),
                    updatedAt: new Date(),
                    deletedAt: null,
                  },
                ]};
              case 'update-deployment':
                  return { command: '', oid: 0, fields: [], rowCount: 2, rows: [
                    {
                      guid: 'aa000a0a-a000-000a-aa00-a0a00a0a0a00',
                      repository: 'https://example.net/',
                      branch: null,
                      trigger: 'manual',
                      organizationGUID: 'bb111b1b-b111-111b-bb11-b1b11b1b1b11',
                      spaceGUID: 'bb111b1b-b111-111b-bb11-b1b11b1b1b11',
                      createdAt: new Date(),
                      updatedAt: new Date(),
                      deletedAt: null,
                    },
                  ]};
              default:
                throw new Error('not expected');
            }
          },
        },
        request: {
          body: {
            repository: 'https://example.net/',
            trigger: 'manual',
            organizationGUID: 'bb111b1b-b111-111b-bb11-b1b11b1b1b11',
            spaceGUID: 'bb111b1b-b111-111b-bb11-b1b11b1b1b11',
          },
        },
        params: {
          deploymentGUID: 'aa000a0a-a000-000a-aa00-a0a00a0a0a00',
        },
      };

      const response = await action.putDeployment(ctx as Context);

      expect(response.status).toEqual(200);
      expect(response.body).toHaveProperty('repository');
      expect(response.body).toHaveProperty('trigger');
      expect(response.body).toHaveProperty('organizationGUID');
      expect(response.body).toMatchObject({organizationGUID: 'bb111b1b-b111-111b-bb11-b1b11b1b1b11'});
    });

    it('should respond with Not Found', async () => {
      const ctx: IContext = {
        db: {
          query: (q: QueryConfig): QueryResult => {
            switch (q.name) {
              case 'fetch-deployment':
                return { command: '', oid: 0, fields: [], rowCount: 2, rows: []};
              case 'update-deployment':
                throw new Error('not expected');
              default:
                throw new Error('not expected');
            }
          },
        },
        request: {
          body: {
            repository: 'https://example.net/',
            trigger: 'manual',
            organizationGUID: 'aa000a0a-a000-000a-aa00-a0a00a0a0a00',
            spaceGUID: 'aa000a0a-a000-000a-aa00-a0a00a0a0a00',
          },
        },
        params: {
          deploymentGUID: 'aa000a0a-a000-000a-aa00-a0a00a0a0a00',
        },
      };

      await expect(action.putDeployment(ctx as Context)).rejects.toThrowError(/Deployment not found/);
    });

    it('should respond with status 422 due to invalid data provided', async () => {
      const ctx: IContext = {
        db: {
          query: (q: QueryConfig): QueryResult => {
            switch (q.name) {
              case 'fetch-deployment':
                throw new Error('not expected');
              case 'update-deployments':
                throw new Error('not expected');
              default:
                throw new Error('not expected');
            }
          },
        },
        request: {
          body: {},
        },
        params: {
          deploymentGUID: 'aa000a0a-a000-000a-aa00-a0a00a0a0a00',
        },
      };

      await expect(action.putDeployment(ctx as Context)).rejects.toThrowError(/Invalid payload provided/);
    });
  });

  describe('delete entity', () => {
    interface IContext {
      db?: any;
      params?: {deploymentGUID: string};
    }

    it('should respond with status No Content', async () => {
      const ctx: IContext = {
        db: {
          query: (q: QueryConfig): QueryResult => {
            switch (q.name) {
              case 'fetch-deployment':
                return { command: '', oid: 0, fields: [], rowCount: 2, rows: [
                  {
                    guid: 'aa000a0a-a000-000a-aa00-a0a00a0a0a00',
                    repository: 'https://example.net/',
                    branch: null,
                    trigger: 'manual',
                    organizationGUID: 'aa000a0a-a000-000a-aa00-a0a00a0a0a00',
                    spaceGUID: 'aa000a0a-a000-000a-aa00-a0a00a0a0a00',
                    createdAt: new Date(),
                    updatedAt: new Date(),
                    deletedAt: null,
                  },
                ]};
              default:
                return {command: '', fields: [], rowCount: 0, rows: [], oid: 0};
            }
          },
        },
        params: {
          deploymentGUID: 'aa000a0a-a000-000a-aa00-a0a00a0a0a00',
        },
      };

      const response = await action.deleteDeployment(ctx as Context);

      expect(response.status).toBe(204);
      expect(response.body).not.toBeDefined();
    });

    it('should respond with Not Found', async () => {
      const ctx: IContext = {
        db: {
          query: (q: QueryConfig): QueryResult => {
            switch (q.name) {
              case 'list-deployments':
                return { command: '', oid: 0, fields: [], rowCount: 2, rows: [
                  {
                    guid: 'aa000a0a-a000-000a-aa00-a0a00a0a0a00',
                    repository: 'https://example.com/',
                    trigger: 'manual',
                  },
                  {
                    guid: 'bb111b1b-b111-111b-bb11-b1b11b1b1b11',
                    repository: 'https://example.com/',
                    branch: 'master',
                    trigger: 'branch',
                  },
                ]};
              case 'count-deployments':
                return {command: '', fields: [], rowCount: 1, rows: [{ total: 12 }], oid: 0};
              default:
                return {command: '', fields: [], rowCount: 0, rows: [], oid: 0};
            }
          },
        },
        params: {
          deploymentGUID: 'aa000a0a-a000-000a-aa00-a0a00a0a0a00',
        },
      };

      await expect(action.deleteDeployment(ctx as Context)).rejects.toThrowError(/Deployment not found/);
    });
  });
});
