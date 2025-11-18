import {
  calculateDailyTarget,
  calculateDaysRemaining,
  calculateProgress,
} from '../../utils/planValidation';

describe('Plan Validation Utils', () => {
  const baseDate = new Date('2024-01-01');
  const quitDate = new Date('2024-01-31');

  describe('calculateDailyTarget', () => {
    it('should calculate correct target for gradual reduction', () => {
      const plan = {
        startDate: baseDate.toISOString(),
        quitDate: quitDate.toISOString(),
        initialDailyAmount: 20,
        reductionMethod: 'gradual' as const,
        cigaretteCost: 10,
        packSize: 20,
      };

      // Day 1: should be close to initial amount
      const day1Target = calculateDailyTarget(plan, new Date('2024-01-01'));
      expect(day1Target).toBeGreaterThan(18);
      expect(day1Target).toBeLessThanOrEqual(20);

      // Day 15: should be around half
      const day15Target = calculateDailyTarget(plan, new Date('2024-01-15'));
      expect(day15Target).toBeGreaterThan(8);
      expect(day15Target).toBeLessThan(12);

      // Quit date: should be 0
      const quitDayTarget = calculateDailyTarget(plan, quitDate);
      expect(quitDayTarget).toBe(0);
    });

    it('should return initial amount for cold turkey before quit date', () => {
      const plan = {
        startDate: baseDate.toISOString(),
        quitDate: quitDate.toISOString(),
        initialDailyAmount: 20,
        reductionMethod: 'cold_turkey' as const,
        cigaretteCost: 10,
        packSize: 20,
      };

      const beforeQuit = calculateDailyTarget(plan, new Date('2024-01-15'));
      expect(beforeQuit).toBe(20);
    });

    it('should return 0 for cold turkey on and after quit date', () => {
      const plan = {
        startDate: baseDate.toISOString(),
        quitDate: quitDate.toISOString(),
        initialDailyAmount: 20,
        reductionMethod: 'cold_turkey' as const,
        cigaretteCost: 10,
        packSize: 20,
      };

      const onQuitDate = calculateDailyTarget(plan, quitDate);
      expect(onQuitDate).toBe(0);

      const afterQuitDate = calculateDailyTarget(plan, new Date('2024-02-01'));
      expect(afterQuitDate).toBe(0);
    });
  });

  describe('calculateDaysRemaining', () => {
    it('should calculate correct days remaining', () => {
      const plan = {
        startDate: baseDate.toISOString(),
        quitDate: quitDate.toISOString(),
        initialDailyAmount: 20,
        reductionMethod: 'gradual' as const,
        cigaretteCost: 10,
        packSize: 20,
      };

      const daysRemaining = calculateDaysRemaining(plan, new Date('2024-01-15'));
      expect(daysRemaining).toBe(16); // 31 - 15 = 16 days
    });

    it('should return 0 for dates on or after quit date', () => {
      const plan = {
        startDate: baseDate.toISOString(),
        quitDate: quitDate.toISOString(),
        initialDailyAmount: 20,
        reductionMethod: 'gradual' as const,
        cigaretteCost: 10,
        packSize: 20,
      };

      expect(calculateDaysRemaining(plan, quitDate)).toBe(0);
      expect(calculateDaysRemaining(plan, new Date('2024-02-01'))).toBe(0);
    });
  });

  describe('calculateProgress', () => {
    it('should calculate progress percentage correctly', () => {
      const plan = {
        startDate: baseDate.toISOString(),
        quitDate: quitDate.toISOString(),
        initialDailyAmount: 20,
        reductionMethod: 'gradual' as const,
        cigaretteCost: 10,
        packSize: 20,
      };

      // Day 1: ~3% progress (1/30)
      const day1Progress = calculateProgress(plan, new Date('2024-01-01'));
      expect(day1Progress).toBeGreaterThan(0);
      expect(day1Progress).toBeLessThan(5);

      // Day 15: ~50% progress
      const day15Progress = calculateProgress(plan, new Date('2024-01-15'));
      expect(day15Progress).toBeGreaterThan(45);
      expect(day15Progress).toBeLessThan(55);

      // Quit date: 100% progress
      const quitDayProgress = calculateProgress(plan, quitDate);
      expect(quitDayProgress).toBe(100);
    });

    it('should return 100 for dates after quit date', () => {
      const plan = {
        startDate: baseDate.toISOString(),
        quitDate: quitDate.toISOString(),
        initialDailyAmount: 20,
        reductionMethod: 'gradual' as const,
        cigaretteCost: 10,
        packSize: 20,
      };

      const afterQuit = calculateProgress(plan, new Date('2024-02-15'));
      expect(afterQuit).toBe(100);
    });
  });
});
