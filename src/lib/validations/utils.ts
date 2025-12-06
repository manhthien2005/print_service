import { ZodError, ZodSchema } from 'zod';

export function formatZodError(
  error: ZodError,
  translate: (key: string, params?: Record<string, unknown>) => string
) {
  const formattedErrors: Record<string, string> = {};

  error.errors.forEach((err) => {
    const path = err.path.join('.');
    const key = err.message;
    // ZodIssue doesn't have params, use empty object if needed
    formattedErrors[path] = translate(key, {});
  });

  return formattedErrors;
}

export function createZodResolver<T extends ZodSchema>(schema: T) {
  return async (values: unknown) => {
    try {
      await schema.parseAsync(values);
      return {};
    } catch (error) {
      if (error instanceof ZodError) {
        return error.formErrors.fieldErrors;
      }
      throw error;
    }
  };
}

