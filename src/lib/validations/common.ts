import { z } from 'zod';

export const emailSchema = z.string().email('validation.email');
export const passwordSchema = z
  .string()
  .min(8, 'validation.minLength')
  .max(100, 'validation.maxLength');

export const requiredStringSchema = z.string().min(1, 'validation.required');

export const optionalStringSchema = z.string().optional();

// Phone number schema: 10-15 digits, max 15 characters
export const phoneNumberSchema = z
  .string()
  .min(1, 'Số điện thoại là bắt buộc')
  .max(15, 'Số điện thoại không được vượt quá 15 ký tự')
  .regex(/^[0-9]{10,15}$/, 'Số điện thoại phải có 10-15 chữ số và chỉ chứa số');
