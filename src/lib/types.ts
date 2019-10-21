export interface IAction<T> {
  readonly status?: number;
  readonly body?: T;
}

export interface IValidationError {
  readonly field: string;
  readonly message: string;
}
