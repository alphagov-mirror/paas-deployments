import { expectEnvironmentVariable } from './environment';

describe(expectEnvironmentVariable, () => {
  beforeAll(() => {
    process.env.TEST = '123456';
  });

  afterAll(() => {
    process.env.TEST = undefined;
  });

  it('should throw an error, if variable is not set', async () => {
    expect(() => {
      expectEnvironmentVariable('MY_CUSTOM_TEST');
    }).toThrowError();
  });

  it('should read environment variable correctly', async () => {
    expect(() => {
      expectEnvironmentVariable('TEST');
    }).not.toThrowError();
    expect(expectEnvironmentVariable('TEST')).toEqual('123456');
  });
});
