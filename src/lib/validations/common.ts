import { z } from 'zod';

export const emailSchema = z.string().email('validation.email');
export const passwordSchema = z
  .string()
  .min(8, 'validation.minLength')
  .max(100, 'validation.maxLength');

export const requiredStringSchema = z.string().min(1, 'validation.required');

export const optionalStringSchema = z.string().optional();
