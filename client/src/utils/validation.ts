/**
 * Client-side validation utilities
 */

export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email.trim());
};

export const validatePassword = (
  password: string
): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];

  if (password.length < 8) {
    errors.push("Password must be at least 8 characters long");
  }

  if (!/[a-z]/.test(password)) {
    errors.push("Password must contain at least one lowercase letter");
  }

  if (!/[A-Z]/.test(password)) {
    errors.push("Password must contain at least one uppercase letter");
  }

  if (!/\d/.test(password)) {
    errors.push("Password must contain at least one number");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

export const validateName = (name: string): boolean => {
  const trimmedName = name.trim();
  return trimmedName.length >= 2 && trimmedName.length <= 50;
};

export const sanitizeInput = (input: string): string => {
  return input.trim().replace(/[<>]/g, "");
};

export const validateCigaretteCount = (
  count: string | number
): { isValid: boolean; error?: string } => {
  const numCount = typeof count === "string" ? parseInt(count, 10) : count;

  if (isNaN(numCount)) {
    return { isValid: false, error: "Please enter a valid number" };
  }

  if (numCount < 1) {
    return { isValid: false, error: "Count must be at least 1" };
  }

  if (numCount > 100) {
    return { isValid: false, error: "Count seems unreasonably high (max 100)" };
  }

  return { isValid: true };
};

export const validateDate = (
  dateString: string
): { isValid: boolean; error?: string } => {
  const date = new Date(dateString);

  if (isNaN(date.getTime())) {
    return { isValid: false, error: "Invalid date format" };
  }

  const now = new Date();
  const oneYearAgo = new Date(
    now.getFullYear() - 1,
    now.getMonth(),
    now.getDate()
  );
  const twoYearsFromNow = new Date(
    now.getFullYear() + 2,
    now.getMonth(),
    now.getDate()
  );

  if (date < oneYearAgo) {
    return { isValid: false, error: "Date cannot be more than 1 year ago" };
  }

  if (date > twoYearsFromNow) {
    return {
      isValid: false,
      error: "Date cannot be more than 2 years in the future",
    };
  }

  return { isValid: true };
};
