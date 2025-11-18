/**
 * Validation utilities for input sanitization and validation
 */

/**
 * Validate email format
 */
const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validate password strength
 */
const isValidPassword = (password) => {
  // At least 8 characters, one lowercase, one uppercase, one number
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
  return passwordRegex.test(password);
};

/**
 * Sanitize string input
 */
const sanitizeString = (str) => {
  if (typeof str !== "string") return "";
  return str.trim().replace(/[<>]/g, "");
};

/**
 * Validate date string
 */
const isValidDate = (dateString) => {
  const date = new Date(dateString);
  return date instanceof Date && !isNaN(date);
};

/**
 * Validate positive number
 */
const isPositiveNumber = (num) => {
  return typeof num === "number" && num > 0 && isFinite(num);
};

/**
 * Validate integer in range
 */
const isValidInteger = (num, min = 0, max = Number.MAX_SAFE_INTEGER) => {
  return Number.isInteger(num) && num >= min && num <= max;
};

module.exports = {
  isValidEmail,
  isValidPassword,
  sanitizeString,
  isValidDate,
  isPositiveNumber,
  isValidInteger,
};

/**
 * Validate journal entry data
 */
const validateJournalEntry = (data) => {
  const errors = [];

  // Validate mood
  const validMoods = ["very_sad", "sad", "neutral", "happy", "very_happy"];
  if (!data.mood || !validMoods.includes(data.mood)) {
    errors.push({
      field: "mood",
      message: "Mood must be one of: very_sad, sad, neutral, happy, very_happy",
    });
  }

  // Validate craving intensity
  if (
    data.cravingIntensity === undefined ||
    !Number.isInteger(data.cravingIntensity) ||
    data.cravingIntensity < 1 ||
    data.cravingIntensity > 10
  ) {
    errors.push({
      field: "cravingIntensity",
      message: "Craving intensity must be an integer between 1 and 10",
    });
  }

  // Validate notes (optional)
  if (data.notes !== undefined && data.notes !== null) {
    if (typeof data.notes !== "string") {
      errors.push({
        field: "notes",
        message: "Notes must be a string",
      });
    } else if (data.notes.length > 1000) {
      errors.push({
        field: "notes",
        message: "Notes must be 1000 characters or less",
      });
    }
  }

  // Validate triggers (optional)
  const validTriggers = [
    "stress",
    "social",
    "habit",
    "boredom",
    "alcohol",
    "coffee",
    "work",
    "anxiety",
    "other",
  ];
  if (data.triggers !== undefined) {
    if (!Array.isArray(data.triggers)) {
      errors.push({
        field: "triggers",
        message: "Triggers must be an array",
      });
    } else {
      const invalidTriggers = data.triggers.filter(
        (t) => !validTriggers.includes(t)
      );
      if (invalidTriggers.length > 0) {
        errors.push({
          field: "triggers",
          message: `Invalid triggers: ${invalidTriggers.join(", ")}`,
        });
      }
    }
  }

  // Validate coping strategies (optional)
  const validStrategies = [
    "breathing",
    "exercise",
    "distraction",
    "support_call",
    "meditation",
    "other",
  ];
  if (data.copingStrategies !== undefined) {
    if (!Array.isArray(data.copingStrategies)) {
      errors.push({
        field: "copingStrategies",
        message: "Coping strategies must be an array",
      });
    } else {
      const invalidStrategies = data.copingStrategies.filter(
        (s) => !validStrategies.includes(s)
      );
      if (invalidStrategies.length > 0) {
        errors.push({
          field: "copingStrategies",
          message: `Invalid coping strategies: ${invalidStrategies.join(", ")}`,
        });
      }
    }
  }

  // Validate delay duration (optional)
  if (data.delayDuration !== undefined && data.delayDuration !== null) {
    if (
      !Number.isInteger(data.delayDuration) ||
      data.delayDuration < 0 ||
      data.delayDuration > 1440
    ) {
      errors.push({
        field: "delayDuration",
        message: "Delay duration must be an integer between 0 and 1440 minutes",
      });
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

module.exports = {
  isValidEmail,
  isValidPassword,
  sanitizeString,
  isValidDate,
  isPositiveNumber,
  isValidInteger,
  validateJournalEntry,
};
