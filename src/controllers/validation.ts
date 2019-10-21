import { IValidationError } from '../lib';
import { IDeployment } from '../repository';

export async function validateDeployment(data: IDeployment): Promise<ReadonlyArray<IValidationError>> {
  const errors: IValidationError[] = [];

  if (data.repository === '') {
    errors.push({field: 'repository', message: 'Repository must be provided'});
  }
  if (!['manual', 'branch', 'release'].includes(data.trigger)) {
    errors.push({field: 'trigger', message: 'Trigger must be provided'});
  }
  if (data.organizationGUID === '') {
    errors.push({field: 'organizationGUID', message: 'Organisation GUID must be provided'});
  }
  if (data.spaceGUID === '') {
    errors.push({field: 'spaceGUID', message: 'Space GUID must be provided'});
  }

  return errors;
}
