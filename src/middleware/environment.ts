export function expectEnvironmentVariable(variable: string): string {
  const value = process.env[variable];
  if (!value) {
    throw new Error(`Environment variable '${variable}' is required`);
  }
  return value;
}
