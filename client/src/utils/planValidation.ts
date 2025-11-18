import { QuitPlanSetup } from '../types/plan';

export interface ValidationError {
  field: keyof QuitPlanSetup;
  message: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
}

/**
 * Validate quit plan setup data
 */
export const validateQuitPlan = (planData: Partial<QuitPlanSetup>): ValidationResult => {
  const errors: ValidationError[] = [];

  // Date validation
  if (planData.startDate) {
    const startDate = new Date(planData.startDate);
    if (isNaN(startDate.getTime())) {
      errors.push({ field: 'startDate', message: 'Invalid start date' });
    }
  }

  if (planData.quitDate) {
    const quitDate = new Date(planData.quitDate);
    if (isNaN(quitDate.getTime())) {
      errors.push({ field: 'quitDate', message: 'Invalid quit date' });
    }
  }

  // Cross-field date validation
  if (planData.startDate && planData.quitDate) {
    const startDate = new Date(planData.startDate);
    const quitDate = new Date(planData.quitDate);
    
    if (!isNaN(startDate.getTime()) && !isNaN(quitDate.getTime())) {
      if (quitDate <= startDate) {
        errors.push({ field: 'quitDate', message: 'Quit date must be after start date' });
      }

      // Check if quit date is too far in the future (more than 2 years)
      const maxDate = new Date(startDate);
      maxDate.setFullYear(maxDate.getFullYear() + 2);
      if (quitDate > maxDate) {
        errors.push({ field: 'quitDate', message: 'Quit date should be within 2 years' });
      }

      // Check if quit date is too soon (less than 1 day)
      const minDate = new Date(startDate);
      minDate.setDate(minDate.getDate() + 1);
      if (quitDate < minDate) {
        errors.push({ field: 'quitDate', message: 'Quit date should be at least 1 day after start date' });
      }
    }
  }

  // Numeric validations
  if (planData.initialDailyAmount !== undefined) {
    if (!Number.isInteger(planData.initialDailyAmount) || planData.initialDailyAmount < 1) {
      errors.push({ field: 'initialDailyAmount', message: 'Daily amount must be at least 1' });
    }
    if (planData.initialDailyAmount > 100) {
      errors.push({ field: 'initialDailyAmount', message: 'Daily amount seems too high (max 100)' });
    }
  }

  if (planData.cigaretteCost !== undefined) {
    if (planData.cigaretteCost < 0) {
      errors.push({ field: 'cigaretteCost', message: 'Cigarette cost cannot be negative' });
    }
    if (planData.cigaretteCost > 1000) {
      errors.push({ field: 'cigaretteCost', message: 'Cigarette cost seems too high' });
    }
  }

  if (planData.packSize !== undefined) {
    if (!Number.isInteger(planData.packSize) || planData.packSize < 1) {
      errors.push({ field: 'packSize', message: 'Pack size must be at least 1' });
    }
    if (planData.packSize > 50) {
      errors.push({ field: 'packSize', message: 'Pack size seems too high (max 50)' });
    }
  }

  // Reduction method validation
  if (planData.reductionMethod && !['gradual', 'cold_turkey'].includes(planData.reductionMethod)) {
    errors.push({ field: 'reductionMethod', message: 'Invalid reduction method' });
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Calculate plan duration in days
 */
export const calculatePlanDuration = (startDate: string, quitDate: string): number => {
  const start = new Date(startDate);
  const quit = new Date(quitDate);
  
  if (isNaN(start.getTime()) || isNaN(quit.getTime())) {
    return 0;
  }
  
  return Math.ceil((quit.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
};

/**
 * Calculate daily reduction amount for gradual method
 */
export const calculateDailyReduction = (
  initialAmount: number,
  startDate: string,
  quitDate: string
): number => {
  const duration = calculatePlanDuration(startDate, quitDate);
  
  if (duration <= 0) {
    return 0;
  }
  
  return initialAmount / duration;
};

/**
 * Calculate estimated savings over the plan period
 */
export const calculateEstimatedSavings = (
  initialDailyAmount: number,
  cigaretteCost: number,
  packSize: number,
  startDate: string,
  quitDate: string
): { totalSavings: number; dailySavings: number } => {
  const duration = calculatePlanDuration(startDate, quitDate);
  const costPerCigarette = cigaretteCost / packSize;
  
  if (duration <= 0) {
    return { totalSavings: 0, dailySavings: 0 };
  }
  
  // For gradual reduction, calculate average daily consumption
  const averageDailyConsumption = initialDailyAmount / 2; // Simplified calculation
  const totalCigarettesSaved = (initialDailyAmount - averageDailyConsumption) * duration;
  const totalSavings = totalCigarettesSaved * costPerCigarette;
  const dailySavings = totalSavings / duration;
  
  return {
    totalSavings: Math.round(totalSavings * 100) / 100,
    dailySavings: Math.round(dailySavings * 100) / 100
  };
};

/**
 * Format date for display
 */
export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  
  if (isNaN(date.getTime())) {
    return 'Invalid Date';
  }
  
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

/**
 * Check if a date string is today
 */
export const isToday = (dateString: string): boolean => {
  const date = new Date(dateString);
  const today = new Date();
  
  return date.toDateString() === today.toDateString();
};

/**
 * Get days until quit date
 */
export const getDaysUntilQuit = (quitDate: string): number => {
  const quit = new Date(quitDate);
  const today = new Date();
  
  if (isNaN(quit.getTime())) {
    return 0;
  }
  
  const diffTime = quit.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  return Math.max(0, diffDays);
};