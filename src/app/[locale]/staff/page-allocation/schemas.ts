import { z } from 'zod';

/**
 * Create add pages schema with i18n support
 */
export const createAddPagesSchema = (t: (key: string) => string) =>
  z.object({
    quantity: z
      .number({
        required_error: t('validation.quantity.required'),
        invalid_type_error: t('validation.quantity.invalid'),
      })
      .min(1, t('validation.quantity.min'))
      .int(t('validation.quantity.integer')),
    note: z.string().optional(),
  });

/**
 * Create update allocation schema with i18n support
 */
export const createUpdateAllocationSchema = (t: (key: string) => string) =>
  z.object({
    quantity: z
      .number({
        required_error: t('validation.quantity.required'),
        invalid_type_error: t('validation.quantity.invalid'),
      })
      .min(0, t('validation.quantity.nonNegative'))
      .int(t('validation.quantity.integer')),
    lowStockThreshold: z
      .number({
        invalid_type_error: t('validation.threshold.invalid'),
      })
      .min(0, t('validation.threshold.nonNegative'))
      .optional(),
    note: z.string().optional(),
  });

/**
 * Create check availability schema with i18n support
 */
export const createCheckAvailabilitySchema = (t: (key: string) => string) =>
  z.object({
    pagesNeeded: z
      .number({
        required_error: t('validation.pagesNeeded.required'),
        invalid_type_error: t('validation.pagesNeeded.invalid'),
      })
      .min(1, t('validation.pagesNeeded.min'))
      .int(t('validation.pagesNeeded.integer')),
  });

export type AddPagesFormData = z.infer<
  ReturnType<typeof createAddPagesSchema>
>;
export type UpdateAllocationFormData = z.infer<
  ReturnType<typeof createUpdateAllocationSchema>
>;
export type CheckAvailabilityFormData = z.infer<
  ReturnType<typeof createCheckAvailabilitySchema>
>;

