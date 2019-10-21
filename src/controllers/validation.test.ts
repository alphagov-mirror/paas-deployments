import { validateDeployment } from './validation';

describe('validation', () => {
  it('should fail to validate deployment due to missing fields', async () => {
    const errs = await validateDeployment({
      repository: '',
      trigger: 'branch',
      organizationGUID: '',
      spaceGUID: '',
    });
    expect(errs.length).toBe(3);
  });

  it('should fail to validate deployment due to invalid trigger', async () => {
    const errs = await validateDeployment({
      repository: 'https://github.com/example/www.git',
      branch: 'master',
      trigger: 'none',
      organizationGUID: 'aa000a0a-a000-000a-aa00-a0a00a0a0a00',
      spaceGUID: 'aa000a0a-a000-000a-aa00-a0a00a0a0a00',
    });
    expect(errs.length).toBe(1);
  });

  it('should validate deployment due to missing fields', async () => {
    const errs = await validateDeployment({
      repository: 'https://github.com/example/www.git',
      branch: 'master',
      trigger: 'branch',
      organizationGUID: 'aa000a0a-a000-000a-aa00-a0a00a0a0a00',
      spaceGUID: 'aa000a0a-a000-000a-aa00-a0a00a0a0a00',
    });
    expect(errs.length).toBe(0);
  });
});
