import {
  validateEmail,
  validatePassword,
  validateQuitPlan,
} from '../../utils/validation';

describe('Validation Utils', () => {
  describe('validateEmail', () => {
    it('should validate correct email addresses', () => {
      expect(validateEmail('test@example.com')).toBe(true);
      expect(validateEmail('user.name+tag@example.co.uk')).toBe(true);
      expect(validateEmail('test123@test-domain.com')).toBe(true);
    });

    it('should reject invalid email addresses', () => {
      expect(validateEmail('')).toBe(false);
      expect(validateEmail('invalid')).toBe(false);
      expect(validateEmail('test@')).toBe(false);
      expect(validateEmail('@example.com')).toBe(false);
      expect(validateEmail('test @example.com')).toBe(false);
    });
  });

  describe('validatePassword', () => {
    it('should validate strong passwords', () => {
      expect(validatePassword('Password123')).toBe(true);
      expect(validatePassword('MyP@ssw0rd')).toBe(true);
      expect(validatePassword('Secure1Pass')).toBe(true);
    });

    it('should reject weak passwords', () => {
      expect(validatePassword('short')).toBe(false);
      expect(validatePassword('alllowercase123')).toBe(false);
      expect(validatePassword('ALLUPPERCASE123')).toBe(false);
      expect(validatePassword('NoNumbers')).toBe(false);
      expect(validatePassword('12345678')).toBe(false);
    });

    it('should require minimum length of 8 characters', () => {
      expect(validatePassword('Pass1')).toBe(false);
      expect(validatePassword('Pass123')).toBe(false);
      expect(validatePassword('Password1')).toBe(true);
    });
  });

  describe('validateQuitPlan', () => {
    const validPlan = {
      startDate: new Date().toISOString(),
      quitDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      initialDailyAmount: 20,
      reductionMethod: 'gradual' as const,
      cigaretteCost: 10,
      packSize: 20,
    };

    it('should validate a correct quit plan', () => {
      const result = validateQuitPlan(validPlan);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject plan with quit date before start date', () => {
      const invalidPlan = {
        ...validPlan,
        quitDate: new Date(Date.now() - 1000).toISOString(),
      };
      const result = validateQuitPlan(invalidPlan);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Quit date must be after start date');
    });

    it('should reject plan with invalid daily amount', () => {
      const invalidPlan = {
        ...validPlan,
        initialDailyAmount: 0,
      };
      const result = validateQuitPlan(invalidPlan);
      expect(result.isValid).toBe(false);
      expect(result.errors.some(e => e.includes('daily amount'))).toBe(true);
    });

    it('should reject plan with invalid cigarette cost', () => {
      const invalidPlan = {
        ...validPlan,
        cigaretteCost: -5,
      };
      const result = validateQuitPlan(invalidPlan);
      expect(result.isValid).toBe(false);
      expect(result.errors.some(e => e.includes('cost'))).toBe(true);
    });

    it('should reject plan with invalid pack size', () => {
      const invalidPlan = {
        ...validPlan,
        packSize: 0,
      };
      const result = validateQuitPlan(invalidPlan);
      expect(result.isValid).toBe(false);
      expect(result.errors.some(e => e.includes('pack size'))).toBe(true);
    });
  });
});
