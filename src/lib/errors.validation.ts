import { IValidationError } from './types';

export class ValidationError extends Error {
  constructor(message: string, public readonly errors: ReadonlyArray<IValidationError>) {
    super(message);
  }
}
