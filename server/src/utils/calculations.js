/**
 * Utility functions for quit plan calculations
 */

/**
 * Calculate daily target for a specific date based on quit plan
 * @param {Object} quitPlan - User's quit plan
 * @param {Date} targetDate - Date to calculate target for
 * @returns {number} Daily cigarette target for the given date
 */
const calculateDailyTarget = (quitPlan, targetDate = new Date()) => {
  if (!quitPlan) return 0;

  const { startDate, quitDate, initialDailyAmount, reductionMethod } = quitPlan;

  if (reductionMethod === "cold_turkey") {
    return new Date(targetDate) >= new Date(quitDate) ? 0 : initialDailyAmount;
  }

  const totalDays = Math.ceil(
    (new Date(quitDate) - new Date(startDate)) / (1000 * 60 * 60 * 24)
  );
  const daysPassed = Math.ceil(
    (new Date(targetDate) - new Date(startDate)) / (1000 * 60 * 60 * 24)
  );

  if (daysPassed <= 0) return initialDailyAmount;
  if (daysPassed >= totalDays) return 0;

  const reductionPerDay = initialDailyAmount / totalDays;
  const currentTarget = Math.max(
    0,
    initialDailyAmount - reductionPerDay * daysPassed
  );

  return Math.round(currentTarget);
};

/**
 * Calculate progress percentage based on quit plan
 * @param {Object} quitPlan - User's quit plan
 * @param {Date} currentDate - Current date
 * @returns {number} Progress percentage (0-100)
 */
const calculateProgressPercentage = (quitPlan, currentDate = new Date()) => {
  if (!quitPlan) return 0;

  const { startDate, quitDate } = quitPlan;
  const start = new Date(startDate);
  const end = new Date(quitDate);
  const current = new Date(currentDate);

  if (current <= start) return 0;
  if (current >= end) return 100;

  const totalDays = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
  const daysPassed = Math.ceil((current - start) / (1000 * 60 * 60 * 24));

  return Math.min(100, Math.round((daysPassed / totalDays) * 100));
};

/**
 * Calculate money saved based on cigarette consumption reduction
 * @param {Object} quitPlan - User's quit plan
 * @param {number} actualConsumption - Actual cigarettes consumed
 * @param {Date} currentDate - Current date
 * @returns {Object} Money saved calculations
 */
const calculateMoneySaved = (
  quitPlan,
  actualConsumption = 0,
  currentDate = new Date()
) => {
  if (!quitPlan) return { dailySaved: 0, totalSaved: 0 };

  const {
    startDate,
    initialDailyAmount,
    cigaretteCost,
    packSize = 20,
  } = quitPlan;
  const costPerCigarette = cigaretteCost / packSize;

  const daysSinceStart = Math.max(
    0,
    Math.ceil(
      (new Date(currentDate) - new Date(startDate)) / (1000 * 60 * 60 * 24)
    )
  );

  // Calculate what user would have smoked without quit plan
  const wouldHaveSmoked = initialDailyAmount * (daysSinceStart + 1);

  // Calculate actual consumption (this would come from logged cigarettes)
  const actualTotal = actualConsumption;

  const cigarettesSaved = Math.max(0, wouldHaveSmoked - actualTotal);
  const totalSaved = cigarettesSaved * costPerCigarette;

  // Daily savings based on target vs actual
  const dailyTarget = calculateDailyTarget(quitPlan, currentDate);
  const dailySaved =
    Math.max(0, initialDailyAmount - dailyTarget) * costPerCigarette;

  return {
    dailySaved: Math.round(dailySaved * 100) / 100,
    totalSaved: Math.round(totalSaved * 100) / 100,
    cigarettesSaved,
    costPerCigarette: Math.round(costPerCigarette * 100) / 100,
  };
};

/**
 * Generate reduction schedule for the entire quit plan period
 * @param {Object} quitPlan - User's quit plan
 * @returns {Array} Array of daily targets with dates
 */
const generateReductionSchedule = (quitPlan) => {
  if (!quitPlan) return [];

  const { startDate, quitDate } = quitPlan;
  const schedule = [];
  const currentDate = new Date(startDate);
  const endDate = new Date(quitDate);

  while (currentDate <= endDate) {
    const target = calculateDailyTarget(quitPlan, new Date(currentDate));
    schedule.push({
      date: new Date(currentDate),
      target,
    });
    currentDate.setDate(currentDate.getDate() + 1);
  }

  return schedule;
};

/**
 * Validate quit plan parameters
 * @param {Object} planData - Quit plan data to validate
 * @returns {Object} Validation result with errors if any
 */
const validateQuitPlan = (planData) => {
  const errors = [];
  const { startDate, quitDate, initialDailyAmount, cigaretteCost } = planData;

  // Date validation
  const start = new Date(startDate);
  const quit = new Date(quitDate);

  if (isNaN(start.getTime())) {
    errors.push("Invalid start date");
  }

  if (isNaN(quit.getTime())) {
    errors.push("Invalid quit date");
  }

  if (start && quit && quit <= start) {
    errors.push("Quit date must be after start date");
  }

  // Numeric validation
  if (!initialDailyAmount || initialDailyAmount < 1) {
    errors.push("Initial daily amount must be at least 1");
  }

  if (cigaretteCost < 0) {
    errors.push("Cigarette cost cannot be negative");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

module.exports = {
  calculateDailyTarget,
  calculateProgressPercentage,
  calculateMoneySaved,
  generateReductionSchedule,
  validateQuitPlan,
};
