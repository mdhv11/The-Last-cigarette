import { useState, useCallback, useEffect, useRef } from 'react';

export interface ValidationRule<T = any> {
  validate: (value: T) => boolean | Promise<boolean>;
  message: string;
  async?: boolean;
}

export interface FormValidationOptions {
  validateOnChange?: boolean;
  validateOnBlur?: boolean;
  debounceMs?: number;
}

/**
 * Enhanced form validation hook with real-time feedback and async validation support
 */
export const useEnhancedFormValidation = <T extends Record<string, any>>(
  initialValues: T,
  validationRules: Record<keyof T, ValidationRule[]>,
  options: FormValidationOptions = {}
) => {
  const {
    validateOnChange = true,
    validateOnBlur = true,
    debounceMs = 300,
  } = options;

  const [values, setValues] = useState<T>(initialValues);
  const [errors, setErrors] = useState<Record<keyof T, string | null>>(
    {} as Record<keyof T, string | null>
  );
  const [touched, setTouched] = useState<Record<keyof T, boolean>>(
    {} as Record<keyof T, boolean>
  );
  const [validating, setValidating] = useState<Record<keyof T, boolean>>(
    {} as Record<keyof T, boolean>
  );

  const debounceTimers = useRef<Record<string, NodeJS.Timeout>>({});

  /**
   * Validate a single field
   */
  const validateField = useCallback(
    async (fieldName: keyof T, value: any): Promise<string | null> => {
      const rules = validationRules[fieldName];
      if (!rules) return null;

      setValidating((prev) => ({ ...prev, [fieldName]: true }));

      try {
        for (const rule of rules) {
          const isValid = rule.async
            ? await rule.validate(value)
            : rule.validate(value);

          if (!isValid) {
            return rule.message;
          }
        }
        return null;
      } finally {
        setValidating((prev) => ({ ...prev, [fieldName]: false }));
      }
    },
    [validationRules]
  );

  /**
   * Handle field value change with optional debouncing
   */
  const handleChange = useCallback(
    (fieldName: keyof T, value: any) => {
      setValues((prev) => ({ ...prev, [fieldName]: value }));

      // Clear existing debounce timer
      if (debounceTimers.current[fieldName as string]) {
        clearTimeout(debounceTimers.current[fieldName as string]);
      }

      // Validate on change if enabled and field has been touched
      if (validateOnChange && touched[fieldName]) {
        debounceTimers.current[fieldName as string] = setTimeout(async () => {
          const error = await validateField(fieldName, value);
          setErrors((prev) => ({ ...prev, [fieldName]: error }));
        }, debounceMs);
      }
    },
    [touched, validateField, validateOnChange, debounceMs]
  );

  /**
   * Handle field blur event
   */
  const handleBlur = useCallback(
    async (fieldName: keyof T) => {
      setTouched((prev) => ({ ...prev, [fieldName]: true }));

      if (validateOnBlur) {
        const error = await validateField(fieldName, values[fieldName]);
        setErrors((prev) => ({ ...prev, [fieldName]: error }));
      }
    },
    [values, validateField, validateOnBlur]
  );

  /**
   * Validate all fields
   */
  const validateAll = useCallback(async (): Promise<boolean> => {
    const newErrors: Record<keyof T, string | null> = {} as Record<
      keyof T,
      string | null
    >;
    let isValid = true;

    // Mark all fields as touched
    setTouched(
      Object.keys(validationRules).reduce(
        (acc, key) => ({ ...acc, [key]: true }),
        {} as Record<keyof T, boolean>
      )
    );

    // Validate all fields
    const validationPromises = Object.keys(validationRules).map(
      async (fieldName) => {
        const error = await validateField(
          fieldName as keyof T,
          values[fieldName as keyof T]
        );
        newErrors[fieldName as keyof T] = error;
        if (error) isValid = false;
      }
    );

    await Promise.all(validationPromises);
    setErrors(newErrors);

    return isValid;
  }, [values, validationRules, validateField]);

  /**
   * Reset form to initial state
   */
  const reset = useCallback(() => {
    setValues(initialValues);
    setErrors({} as Record<keyof T, string | null>);
    setTouched({} as Record<keyof T, boolean>);
    setValidating({} as Record<keyof T, boolean>);

    // Clear all debounce timers
    Object.values(debounceTimers.current).forEach(clearTimeout);
    debounceTimers.current = {};
  }, [initialValues]);

  /**
   * Set a specific field error manually
   */
  const setFieldError = useCallback((fieldName: keyof T, error: string | null) => {
    setErrors((prev) => ({ ...prev, [fieldName]: error }));
  }, []);

  /**
   * Set a specific field value manually
   */
  const setFieldValue = useCallback((fieldName: keyof T, value: any) => {
    setValues((prev) => ({ ...prev, [fieldName]: value }));
  }, []);

  /**
   * Clear all errors
   */
  const clearErrors = useCallback(() => {
    setErrors({} as Record<keyof T, string | null>);
  }, []);

  // Cleanup debounce timers on unmount
  useEffect(() => {
    return () => {
      Object.values(debounceTimers.current).forEach(clearTimeout);
    };
  }, []);

  return {
    values,
    errors,
    touched,
    validating,
    handleChange,
    handleBlur,
    validateAll,
    validateField,
    reset,
    setFieldError,
    setFieldValue,
    clearErrors,
    isValid: Object.values(errors).every((error) => !error),
    isDirty: JSON.stringify(values) !== JSON.stringify(initialValues),
  };
};
