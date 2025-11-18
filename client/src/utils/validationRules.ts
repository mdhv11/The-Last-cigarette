import { ValidationRule } from '../hooks/useFormValidation';

export const required = (message: string = 'This field is required'): ValidationRule => ({
  validate: (value: any) => {
    if (typeof value === 'string') {
      return value.trim().length > 0;
    }
    return value !== null && value !== undefined && value !== '';
  },
  message,
});

export const email = (message: string = 'Please enter a valid email address'): ValidationRule => ({
  validate: (value: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return !value || emailRegex.test(value);
  },
  message,
});

export const minLength = (min: number, message?: string): ValidationRule => ({
  validate: (value: string) => !value || value.length >= min,
  message: message || `Must be at least ${min} characters`,
});

export const maxLength = (max: number, message?: string): ValidationRule => ({
  validate: (value: string) => !value || value.length <= max,
  message: message || `Must be no more than ${max} characters`,
});

export const minValue = (min: number, message?: string): ValidationRule => ({
  validate: (value: number) => value === undefined || value >= min,
  message: message || `Must be at least ${min}`,
});

export const maxValue = (max: number, message?: string): ValidationRule => ({
  validate: (value: number) => value === undefined || value <= max,
  message: message || `Must be no more than ${max}`,
});

export const pattern = (regex: RegExp, message: string): ValidationRule => ({
  validate: (value: string) => !value || regex.test(value),
  message,
});

export const password = (message: string = 'Password must be at least 8 characters with uppercase, lowercase, and number'): ValidationRule => ({
  validate: (value: string) => {
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
    return !value || passwordRegex.test(value);
  },
  message,
});

export const matchField = (fieldName: string, getFieldValue: () => any, message?: string): ValidationRule => ({
  validate: (value: any) => value === getFieldValue(),
  message: message || `Must match ${fieldName}`,
});

export const positiveNumber = (message: string = 'Must be a positive number'): ValidationRule => ({
  validate: (value: number) => value === undefined || (typeof value === 'number' && value > 0),
  message,
});

export const integer = (message: string = 'Must be a whole number'): ValidationRule => ({
  validate: (value: number) => value === undefined || Number.isInteger(value),
  message,
});

export const dateAfter = (compareDate: Date, message?: string): ValidationRule => ({
  validate: (value: string | Date) => {
    if (!value) return true;
    const date = typeof value === 'string' ? new Date(value) : value;
    return date > compareDate;
  },
  message: message || `Must be after ${compareDate.toLocaleDateString()}`,
});

export const dateBefore = (compareDate: Date, message?: string): ValidationRule => ({
  validate: (value: string | Date) => {
    if (!value) return true;
    const date = typeof value === 'string' ? new Date(value) : value;
    return date < compareDate;
  },
  message: message || `Must be before ${compareDate.toLocaleDateString()}`,
});
